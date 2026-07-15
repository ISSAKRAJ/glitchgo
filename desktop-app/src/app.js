const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

// UI Navigation items
const navStatus = document.getElementById('nav-status');
const navFirewall = document.getElementById('nav-firewall');
const navLogs = document.getElementById('nav-logs');

const secStatus = document.getElementById('section-status');
const secFirewall = document.getElementById('section-firewall');
const secLogs = document.getElementById('section-logs');

const title = document.getElementById('workspace-title');
const subtitle = document.getElementById('workspace-subtitle');

// Tab toggles
function showSection(section, activeNav, titleText, subtitleText) {
  [secStatus, secFirewall, secLogs].forEach(s => s.classList.add('hidden'));
  [navStatus, navFirewall, navLogs].forEach(n => n.classList.remove('nav-active'));
  
  section.classList.remove('hidden');
  activeNav.classList.add('nav-active');
  title.innerText = titleText;
  subtitle.innerText = subtitleText;
}

navStatus.addEventListener('click', () => {
  showSection(secStatus, navStatus, 'Local Server Status', 'SecOps Gateway Control');
});
navFirewall.addEventListener('click', () => {
  showSection(secFirewall, navFirewall, 'AST Firewall Settings', 'Compiler Security Policies');
});
navLogs.addEventListener('click', () => {
  showSection(secLogs, navLogs, 'Telemetry Log Audits', 'Local Proxy Intercept Monitor');
});

// App State Configurations
let currentConfig = {
  license_key: '',
  db_dialect: 'postgres',
  db_uri: '',
  gemini_api_key: '',
  blocked_tables: '',
  enforce_read_only: true,
  query_count: 0,
  max_queries: 500,
  tier: 'free',
  active: false
};

// Form Inputs
const inputLicense = document.getElementById('input-license');
const inputDialect = document.getElementById('input-dialect');
const inputUri = document.getElementById('input-uri');
const inputApikey = document.getElementById('input-apikey');
const inputReadonly = document.getElementById('input-readonly');
const inputBlocked = document.getElementById('input-blocked');

const configForm = document.getElementById('config-form');
const btnTest = document.getElementById('btn-test');
const btnSync = document.getElementById('btn-sync');
const btnSaveRules = document.getElementById('btn-save-rules');
const statusMessage = document.getElementById('status-message');

const badgeLicense = document.getElementById('license-badge');
const creditsText = document.getElementById('credits-text');
const creditsBar = document.getElementById('credits-bar');

const logsTbody = document.getElementById('logs-tbody');

// Helper to show inline alerts
function showAlert(message, type) {
  statusMessage.innerText = message;
  statusMessage.className = `p-3.5 rounded-xl text-xs font-mono border block ${
    type === 'success' 
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
      : 'bg-red-500/10 border-red-500/30 text-red-405'
  }`;
  
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 5000);
}

// Update Quota details in UI
function updateUiMetrics() {
  badgeLicense.innerText = `${currentConfig.tier.toUpperCase()} ${currentConfig.active ? 'ACTIVE' : 'INACTIVE'}`;
  badgeLicense.className = `px-2 py-0.5 rounded text-xs font-bold uppercase border ${
    currentConfig.active 
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
      : 'bg-slate-900 border-slate-850 text-slate-500'
  }`;

  const remaining = Math.max(0, currentConfig.max_queries - currentConfig.query_count);
  creditsText.innerText = `${currentConfig.query_count} / ${currentConfig.max_queries} queries used`;
  
  const pct = Math.min(100, Math.round((currentConfig.query_count / (currentConfig.max_queries || 1)) * 100));
  creditsBar.style.width = `${pct}%`;
  creditsBar.className = `h-full rounded-full transition-all duration-300 ${pct > 90 ? 'bg-red-500' : 'bg-emerald-500'}`;
}

// Save Configuration
async function saveConfigState() {
  currentConfig.license_key = inputLicense.value.trim();
  currentConfig.db_dialect = inputDialect.value;
  currentConfig.db_uri = inputUri.value.trim();
  currentConfig.gemini_api_key = inputApikey.value.trim();
  currentConfig.enforce_read_only = inputReadonly.checked;
  currentConfig.blocked_tables = inputBlocked.value.trim();

  try {
    const success = await invoke('save_config', { config: currentConfig });
    if (success) {
      showAlert('Configurations saved successfully!', 'success');
      updateUiMetrics();
    }
  } catch (err) {
    showAlert(`Error saving configurations: ${err}`, 'error');
  }
}

configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  saveConfigState();
});

btnSaveRules.addEventListener('click', () => {
  saveConfigState();
});

// Test Connection
btnTest.addEventListener('click', async () => {
  const dialect = inputDialect.value;
  const uri = inputUri.value.trim();

  if (!uri) {
    showAlert('Please input a Database URI first.', 'error');
    return;
  }

  btnTest.innerText = 'Connecting...';
  try {
    const success = await invoke('test_connection', { dialect, uri });
    if (success) {
      showAlert('Database connection test successful!', 'success');
    }
  } catch (err) {
    showAlert(`Connection failed: ${err}`, 'error');
  } finally {
    btnTest.innerText = 'Test database connection';
  }
});

// Sync Licenses
btnSync.addEventListener('click', async () => {
  const lic = inputLicense.value.trim();
  if (!lic) {
    showAlert('Config key required to sync license.', 'error');
    return;
  }
  
  btnSync.innerText = 'Syncing...';
  try {
    currentConfig.license_key = lic;
    const updated = await invoke('sync_license_now');
    currentConfig = updated;
    updateUiMetrics();
    showAlert('License successfully synced with Cloud!', 'success');
  } catch (err) {
    showAlert(`Sync failed: ${err}`, 'error');
  } finally {
    btnSync.innerText = 'Sync Key Status';
  }
});

// Listen to Telemetry Log events emitted by Rust proxy
let logCount = 0;
listen('new-query-log', (event) => {
  const log = event.payload;
  
  if (logCount === 0) {
    logsTbody.innerHTML = ''; // clear placeholder
  }

  // Increment query count if query was parsed
  currentConfig.query_count += 1;
  updateUiMetrics();

  const tr = document.createElement('tr');
  tr.className = 'border-b border-slate-850 hover:bg-slate-900/40';
  
  const statusBadge = log.status === 'success'
    ? '<span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase text-[9px]">success</span>'
    : `<span class="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase text-[9px]" title="${log.details}">blocked</span>`;

  tr.innerHTML = `
    <td class="p-3 text-slate-500 whitespace-nowrap">${log.timestamp}</td>
    <td class="p-3 text-slate-200 select-text font-sans">${log.prompt}</td>
    <td class="p-3 text-indigo-300 select-text font-mono">${log.sql}</td>
    <td class="p-3 whitespace-nowrap">${statusBadge}</td>
  `;
  
  logsTbody.insertBefore(tr, logsTbody.firstChild);
  logCount += 1;
});
