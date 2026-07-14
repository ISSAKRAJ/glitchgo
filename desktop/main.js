const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const mysql = require('mysql2/promise');
const { parse } = require('pgsql-ast-parser');
const { GoogleGenAI } = require('@google/genai');

// Config file path in user data folder
const CONFIG_PATH = path.join(app.getPath('userData'), 'adminzero_config.json');

let mainWindow;
let localProxyServer;
let activeConfig = {
  licenseKey: '',
  dbDialect: 'postgres',
  dbUri: '',
  geminiApiKey: '',
  blockedTables: '',
  enforceReadOnly: true,
  queryCount: 0,
  maxQueries: 500,
  tier: 'free',
  active: false
};

// Queue of query events to stream to the GUI
const logQueue = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    backgroundColor: '#020617', // slate-950
    title: "AdminZero Desktop Gateway",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  
  // Stream any cached log logs to UI once ready
  mainWindow.webContents.on('did-finish-load', () => {
    loadEncryptedConfig();
    syncLicenseWithCloud();
    logQueue.forEach(log => mainWindow.webContents.send('new-query-log', log));
  });
}

// ----------------------------------------------------
// LOCAL SECURE ENCRYPTED STORAGE
// ----------------------------------------------------
function saveEncryptedConfig(configData) {
  try {
    const dataToSave = { ...configData };
    
    // Encrypt sensitive credentials before saving to disk
    if (dataToSave.dbUri && safeStorage.isEncryptionAvailable()) {
      dataToSave.dbUri = safeStorage.encryptString(dataToSave.dbUri).toString('base64');
    }
    if (dataToSave.geminiApiKey && safeStorage.isEncryptionAvailable()) {
      dataToSave.geminiApiKey = safeStorage.encryptString(dataToSave.geminiApiKey).toString('base64');
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(dataToSave, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing config:', err);
    return false;
  }
}

function loadEncryptedConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return;
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Decrypt credentials
    if (parsed.dbUri && safeStorage.isEncryptionAvailable()) {
      try {
        parsed.dbUri = safeStorage.decryptString(Buffer.from(parsed.dbUri, 'base64'));
      } catch (e) { parsed.dbUri = ''; }
    }
    if (parsed.geminiApiKey && safeStorage.isEncryptionAvailable()) {
      try {
        parsed.geminiApiKey = safeStorage.decryptString(Buffer.from(parsed.geminiApiKey, 'base64'));
      } catch (e) { parsed.geminiApiKey = ''; }
    }

    activeConfig = { ...activeConfig, ...parsed };
    if (mainWindow) {
      mainWindow.webContents.send('config-loaded', {
        licenseKey: activeConfig.licenseKey,
        dbDialect: activeConfig.dbDialect,
        dbUri: activeConfig.dbUri,
        geminiApiKey: activeConfig.geminiApiKey,
        blockedTables: activeConfig.blockedTables,
        enforceReadOnly: activeConfig.enforceReadOnly,
        queryCount: activeConfig.queryCount,
        maxQueries: activeConfig.maxQueries,
        tier: activeConfig.tier,
        active: activeConfig.active
      });
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
}

// ----------------------------------------------------
// CLOUD CONTROL PLANE TELEMETRY SYNC
// ----------------------------------------------------
async function syncLicenseWithCloud(increment = 0, threatsCount = 0) {
  if (!activeConfig.licenseKey) return;
  try {
    const cloudApiUrl = 'https://glitchgo.vercel.app/api/v1/license/sync'; // fallback to live vercel URL
    const response = await fetch(cloudApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: activeConfig.licenseKey,
        queryCountIncrement: increment,
        threatsBlockedIncrement: threatsCount
      })
    });
    
    const result = await response.json();
    if (result && result.tier) {
      activeConfig.tier = result.tier;
      activeConfig.active = result.active;
      activeConfig.maxQueries = (activeConfig.queryCount || 0) + result.creditsRemaining;
      
      // Update local storage metrics
      saveEncryptedConfig(activeConfig);
      
      if (mainWindow) {
        mainWindow.webContents.send('license-synced', {
          active: result.active,
          creditsRemaining: result.creditsRemaining,
          tier: result.tier
        });
      }
    }
  } catch (err) {
    console.warn('Could not sync with cloud license plane:', err.message);
  }
}

// ----------------------------------------------------
// LOCAL SQL AST SEC-OPS FIREWALL
// ----------------------------------------------------
function checkAstSafety(sql, dialect, blockedTables, enforceReadOnly) {
  // Pre-parser defense: Sanity check for comment injection obfuscation
  const normalizedRaw = sql.toLowerCase().replace(/\s+/g, ' ');
  if (normalizedRaw.includes('/*') || normalizedRaw.includes('--')) {
    const suspiciousKeywords = [
      'drop', 'delete', 'update', 'insert', 'alter', 'truncate', 
      'pg_', 'information_schema', 'mysql', 'schema', 'credential'
    ];
    if (suspiciousKeywords.some(kw => normalizedRaw.includes(kw))) {
      throw new Error('THREAT BLOCKED: Suspicious keyword detected inside SQL comment syntax.');
    }
  }

  if (dialect === 'postgres') {
    try {
      const ast = parse(sql);
      const normalizedBlocked = blockedTables.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      
      const checkNode = (node) => {
        if (!node || typeof node !== 'object') return;
        
        // Block forbidden statement types
        if (node.type) {
          const type = String(node.type).toLowerCase();
          const forbiddenTypes = [
            'insert', 'update', 'delete', 'drop', 'alter', 'truncate', 
            'create', 'grant', 'revoke', 'replace', 'transaction', 
            'commit', 'rollback', 'copy', 'explain', 'prepare', 'execute', 'deallocate'
          ];
          if (forbiddenTypes.some(m => type.includes(m))) {
            throw new Error(`THREAT BLOCKED: Statement type [${type.toUpperCase()}] is prohibited under strict security policies.`);
          }
        }
        
        // Table reference check (forbidden tables & metadata schemas)
        if (node.type === 'tableRef' && node.name) {
          const tableNameClean = String(node.name).replace(/[`"\[\]]/g, '').toLowerCase();
          const schemaNameClean = node.schema ? String(node.schema).replace(/[`"\[\]]/g, '').toLowerCase() : '';

          if (normalizedBlocked.includes(tableNameClean)) {
            throw new Error(`THREAT BLOCKED: Restricted table access attempt on '${node.name}'.`);
          }

          const sensitiveSchemas = ['information_schema', 'pg_catalog', 'performance_schema', 'sys', 'mysql'];
          if (sensitiveSchemas.includes(schemaNameClean) || sensitiveSchemas.includes(tableNameClean)) {
            throw new Error(`THREAT BLOCKED: Administrative database schema access denied on '${node.name}'.`);
          }
          
          if (tableNameClean.startsWith('pg_') || tableNameClean.startsWith('mysql_')) {
            throw new Error(`THREAT BLOCKED: System table access attempt on '${node.name}'.`);
          }
        }

        // Check administrative function calls
        if (node.type === 'call' && node.function) {
          const funcName = String(node.function.name).toLowerCase();
          const forbiddenFunctions = [
            'sleep', 'pg_sleep', 'sys_eval', 'sys_exec', 'version', 
            'load_file', 'current_setting', 'session_user', 'execute'
          ];
          if (forbiddenFunctions.some(f => funcName.includes(f))) {
            throw new Error(`THREAT BLOCKED: Execution of administrative function '${funcName}' is blocked.`);
          }
        }
        
        for (const key in node) {
          if (Object.prototype.hasOwnProperty.call(node, key)) {
            const child = node[key];
            if (Array.isArray(child)) {
              child.forEach(checkNode);
            } else if (typeof child === 'object' && child !== null) {
              checkNode(child);
            }
          }
        }
      };

      for (const stmt of ast) {
        if (stmt.type) {
          const type = String(stmt.type).toLowerCase();
          if (!['select', 'show', 'describe'].some(t => type.includes(t))) {
            throw new Error(`THREAT BLOCKED: Statement type [${type.toUpperCase()}] is forbidden.`);
          }
        }
        checkNode(stmt);
      }
    } catch (err) {
      throw new Error(err.message.includes('THREAT BLOCKED') ? err.message : `THREAT BLOCKED: Obfuscation parsing failure. Syntax error detected.`);
    }
  } else {
    // MySQL regex validation fallback
    const upperSql = sql.toUpperCase();
    const normalizedBlocked = blockedTables.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    
    if (enforceReadOnly) {
      const writeKeywords = [
        'INSERT ', 'UPDATE ', 'DELETE ', 'DROP ', 'ALTER ', 'CREATE ', 
        'TRUNCATE ', 'REPLACE ', 'GRANT ', 'REVOKE ', 'EXECUTE '
      ];
      if (writeKeywords.some(kw => upperSql.includes(kw))) {
        throw new Error(`THREAT BLOCKED: Write/mutation commands are forbidden under Read-Only rules.`);
      }
    }

    const sensitiveTables = ['INFORMATION_SCHEMA', 'PG_CATALOG', 'MYSQL', 'SYS', 'PERFORMANCE_SCHEMA'];
    if (sensitiveTables.some(t => upperSql.includes(t))) {
      throw new Error(`THREAT BLOCKED: Administrative database schema access denied.`);
    }
    
    for (const table of normalizedBlocked) {
      if (upperSql.includes(table)) {
        throw new Error(`THREAT BLOCKED: Restricted table access attempt on '${table}'.`);
      }
    }
  }
}

// ----------------------------------------------------
// LOCAL PROXY GATEWAY SERVER (PORT 5001)
// ----------------------------------------------------
function startLocalProxy() {
  if (localProxyServer) return;
  
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  expressApp.post('/v1/query', async (req, res) => {
    const { prompt } = req.body;
    const logEvent = {
      timestamp: new Date().toISOString(),
      prompt: prompt || 'Empty Prompt',
      sql: '',
      status: 'pending',
      details: ''
    };

    try {
      // 1. License Check
      if (activeConfig.maxQueries > 0 && activeConfig.queryCount >= activeConfig.maxQueries) {
        throw new Error('License credit limit exceeded. Refill your quota at glitchgo.vercel.app/portal');
      }

      if (!activeConfig.dbUri) {
        throw new Error('Database connection URL not configured in desktop dashboard.');
      }

      // 2. Prompt-to-SQL Conversion
      let generatedSql = '';
      if (activeConfig.geminiApiKey) {
        const ai = new GoogleGenAI({ apiKey: activeConfig.geminiApiKey });
        const systemPrompt = `You are a secure database text-to-SQL compiler translating questions into raw ${activeConfig.dbDialect} queries. 
Only output raw executable SQL. Do NOT wrap in markdown backticks or enclose in code blocks.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction: systemPrompt }
        });
        generatedSql = response.text.trim();
      } else {
        // Fallback: If no Gemini key is provided, assume prompt is raw SQL
        generatedSql = prompt;
      }

      logEvent.sql = generatedSql;

      // 3. Security AST Firewall check
      checkAstSafety(
        generatedSql, 
        activeConfig.dbDialect, 
        activeConfig.blockedTables, 
        activeConfig.enforceReadOnly
      );

      // 4. Local Database Execution
      let queryResult;
      if (activeConfig.dbDialect === 'postgres') {
        const client = new Client({ connectionString: activeConfig.dbUri });
        await client.connect();
        const dbRes = await client.query(generatedSql);
        queryResult = dbRes.rows;
        await client.end();
      } else {
        const connection = await mysql.createConnection(activeConfig.dbUri);
        const [rows] = await connection.execute(generatedSql);
        queryResult = rows;
        await connection.end();
      }

      // 5. Audit Log Success
      logEvent.status = 'success';
      logEvent.details = `Parsed & Executed safe query. Rows returned: ${Array.isArray(queryResult) ? queryResult.length : 1}`;
      
      // Update local and cloud counters
      activeConfig.queryCount += 1;
      saveEncryptedConfig(activeConfig);
      syncLicenseWithCloud(1, 0);

      res.status(200).json({ status: 'success', sql: generatedSql, data: queryResult });

    } catch (err) {
      logEvent.status = 'failed';
      logEvent.details = err.message;
      
      if (err.message.includes('THREAT BLOCKED')) {
        syncLicenseWithCloud(0, 1); // Log threat block telemetry to cloud
      }

      res.status(err.message.includes('THREAT BLOCKED') ? 403 : 400).json({
        status: 'blocked',
        error: err.message
      });
    } finally {
      logQueue.push(logEvent);
      if (logQueue.length > 50) logQueue.shift();
      if (mainWindow) {
        mainWindow.webContents.send('new-query-log', logEvent);
      }
    }
  });

  localProxyServer = expressApp.listen(5001, () => {
    console.log('Local AdminZero SecOps gateway active on port 5001');
  });
}

// ----------------------------------------------------
// IPC EVENT HANDLERS
// ----------------------------------------------------
ipcMain.handle('save-config', async (event, newConfig) => {
  activeConfig = { ...activeConfig, ...newConfig };
  const success = saveEncryptedConfig(activeConfig);
  if (success) {
    syncLicenseWithCloud();
  }
  return success;
});

ipcMain.handle('test-connection', async (event, { dialect, uri }) => {
  try {
    if (dialect === 'postgres') {
      const client = new Client({ connectionString: uri, connectionTimeoutMillis: 5000 });
      await client.connect();
      await client.end();
    } else {
      const connection = await mysql.createConnection({ uri, connectTimeout: 5000 });
      await connection.end();
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('sync-license-now', async () => {
  await syncLicenseWithCloud();
  return {
    tier: activeConfig.tier,
    queryCount: activeConfig.queryCount,
    maxQueries: activeConfig.maxQueries,
    active: activeConfig.active
  };
});

app.whenReady().then(() => {
  createWindow();
  startLocalProxy();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
