#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use warp::Filter;

#[derive(Clone, Serialize, Deserialize, Debug)]
struct AppConfig {
  license_key: String,
  db_dialect: String,
  db_uri: String,
  gemini_api_key: String,
  blocked_tables: String,
  enforce_read_only: bool,
  query_count: u32,
  max_queries: u32,
  tier: String,
  active: bool
}

#[derive(Serialize, Clone, Debug)]
struct QueryLog {
  timestamp: String,
  prompt: String,
  sql: String,
  status: String,
  details: String
}

// Global state to store active configurations
struct AppState {
  config: Mutex<AppConfig>,
}

#[tauri::command]
fn save_config(config: AppConfig, state: tauri::State<AppState>) -> bool {
  let mut state_config = state.config.lock().unwrap();
  *state_config = config;
  true
}

#[tauri::command]
async fn test_connection(dialect: String, uri: String) -> Result<bool, String> {
  // Simple check for valid connection syntax
  if uri.is_empty() {
    return Err("Database URI connection string cannot be empty.".into());
  }
  if dialect == "postgres" && !uri.starts_with("postgres://") && !uri.starts_with("postgresql://") {
    return Err("Invalid connection URL format for PostgreSQL.".into());
  }
  if dialect == "mysql" && !uri.starts_with("mysql://") {
    return Err("Invalid connection URL format for MySQL.".into());
  }
  Ok(true)
}

#[tauri::command]
async fn sync_license_now(state: tauri::State<'_, AppState>) -> Result<AppConfig, String> {
  let config = {
    let state_config = state.config.lock().unwrap();
    state_config.clone()
  };

  if config.license_key.is_empty() {
    return Err("No license key configured.".into());
  }

  // Calls cloud control plane to fetch quotas
  let client = reqwest::Client::new();
  let sync_url = "https://glitchgo.vercel.app/api/v1/license/sync";
  
  let payload = serde_json::json!({
    "licenseKey": config.license_key,
    "queryCountIncrement": 0,
    "threatsBlockedIncrement": 0
  });

  match client.post(sync_url).json(&payload).send().await {
    Ok(res) => {
      if res.status().is_success() {
        #[derive(Deserialize)]
        struct SyncResponse {
          active: bool,
          creditsRemaining: u32,
          tier: String
        }
        if let Ok(data) = res.json::<SyncResponse>().await {
          let mut state_config = state.config.lock().unwrap();
          state_config.active = data.active;
          state_config.tier = data.tier;
          state_config.max_queries = state_config.query_count + data.creditsRemaining;
          return Ok(state_config.clone());
        }
      }
      Err("Invalid response from licensing cloud.".into())
    }
    Err(e) => Err(format!("Could not connect to licensing cloud: {}", e))
  }
}

// Deterministic Rust AST check simulation (blocks writing statement types or catalog references)
fn run_query_checks(sql: &str, blocked_tables: &str, read_only: bool) -> Result<(), String> {
  let upper = sql.to_uppercase();
  
  // Comment checking
  if upper.contains("/*") || upper.contains("--") {
    let suspicious = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "PG_", "INFORMATION_SCHEMA"];
    if suspicious.iter().any(|kw| upper.contains(kw)) {
      return Err("THREAT BLOCKED: Suspicious keyword detected inside SQL comment syntax.".into());
    }
  }

  if read_only {
    let mutations = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE", "GRANT", "EXECUTE"];
    if mutations.iter().any(|kw| upper.contains(kw)) {
      return Err("THREAT BLOCKED: Write/mutation commands are forbidden under Read-Only rules.".into());
    }
  }

  // Block system schema metadata queries
  let sys_schemas = ["INFORMATION_SCHEMA", "PG_CATALOG", "MYSQL", "SYS", "PERFORMANCE_SCHEMA"];
  if sys_schemas.iter().any(|s| upper.contains(s)) {
    return Err("THREAT BLOCKED: Administrative database schema access denied.".into());
  }

  // Block customized table names
  let blocked_list: Vec<&str> = blocked_tables.split(',').map(|t| t.trim()).filter(|t| !t.is_empty()).collect();
  for table in blocked_list {
    if upper.contains(&table.to_uppercase()) {
      return Err(format!("THREAT BLOCKED: Restricted table access attempt on '{}'.", table));
    }
  }

  Ok(())
}

fn main() {
  let config = AppConfig {
    license_key: String::new(),
    db_dialect: "postgres".into(),
    db_uri: String::new(),
    gemini_api_key: String::new(),
    blocked_tables: String::new(),
    enforce_read_only: true,
    query_count: 0,
    max_queries: 500,
    tier: "free".into(),
    active: false
  };

  let state = Arc::new(AppState {
    config: Mutex::new(config)
  });

  let state_clone = state.clone();

  // Create build wrapper
  let app = tauri::Builder::default()
    .manage(AppState {
      config: Mutex::new(state_clone.config.lock().unwrap().clone())
    });

  let app_handle = app.build(tauri::generate_context!())
    .expect("error while building tauri application");

  let handle_clone = app_handle.clone();

  // Spin up local proxy HTTP server on port 5001 inside async tokio thread
  tokio::spawn(async move {
    #[derive(Deserialize)]
    struct QueryRequest {
      prompt: String
    }

    let query_route = warp::post()
      .and(warp::path("v1"))
      .and(warp::path("query"))
      .and(warp::body::json())
      .map(move |body: QueryRequest| {
        let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let mut sql = body.prompt.clone();
        
        let state_guard = state.config.lock().unwrap();
        
        let mut log = QueryLog {
          timestamp,
          prompt: body.prompt,
          sql: sql.clone(),
          status: "success".into(),
          details: "Safe query parsed & executed.".into()
        };

        let result = if state_guard.db_uri.is_empty() {
          Err("Database URI not configured.".to_string())
        } else if state_guard.max_queries > 0 && state_guard.query_count >= state_guard.max_queries {
          Err("License credit limit exceeded. Refill your quota.".to_string())
        } else {
          // If gemini api key is missing, treat prompt as raw SQL
          if !state_guard.gemini_api_key.is_empty() {
            sql = format!("SELECT * FROM sales; -- Simulated SQL translation for: {}", sql);
            log.sql = sql.clone();
          }
          
          run_query_checks(&sql, &state_guard.blocked_tables, state_guard.enforce_read_only)
        };

        if let Err(msg) = result {
          log.status = "failed".into();
          log.details = msg.clone();
          handle_clone.emit_all("new-query-log", log.clone()).unwrap();
          return warp::reply::json(&serde_json::json!({
            "status": "blocked",
            "error": msg
          }));
        }

        // Increment count
        // Note: In production, save updated config state
        handle_clone.emit_all("new-query-log", log.clone()).unwrap();

        warp::reply::json(&serde_json::json!({
          "status": "success",
          "sql": sql,
          "data": []
        }))
      });

    warp::serve(query_route)
      .run(([127, 0, 0, 1], 5001))
      .await;
  });

  app_handle.run(|_, _| {});
}
