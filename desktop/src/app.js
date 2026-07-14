// DOM Elements
const navStatus = document.getElementById('nav-status');
const navFirewall = document.getElementById('nav-firewall');
const navLogs = document.getElementById('nav-logs');

const secStatus = document.getElementById('section-status');
const secFirewall = document.getElementById('section-firewall');
const secLogs = document.getElementById('section-logs');

const workspaceTitle = document.getElementById('workspace-title');
const workspaceSubtitle = document.getElementById('workspace-subtitle');

const configForm = document.getElementById('config-form');
const inputLicense = document.getElementById('input-license');
const inputDialect = document.getElementById('input-dialect');
const inputUri = document.getElementById('input-uri');
const inputApiKey = document.getElementById('input-apikey');
const inputBlocked = document.getElementById('input-blocked');
const inputReadOnly = document.getElementById('input-readonly');

const btnTest = document.getElementById('btn-test');
const btnSync = document.getElementById('btn-sync');
const btnSaveRules = document.getElementById('btn-save-rules');
const statusMessage = document.getElementById('status-message');

const creditsText = document.getElementById('credits-text');
const creditsBar = document.getElementById('credits-bar');
const licenseBadge = document.getElementById('license-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

const logsTbody = document.getElementById('logs-tbody');

let localQueryCount = 0;
let localMaxQueries = 500;

// ----------------------------------------------------
// TAB NAVIGATION
// ----------------------------------------------------
function switchTab(activeBtn, activeSec, title, subtitle) {
  [navStatus, navFirewall, navLogs].forEach(btn => btn.classList.remove('nav-active'));
  [secStatus, secFirewall, secLogs].forEach(sec => sec.classList.add('hidden'));
  
  activeBtn.classList.add('nav-active');
  activeSec.classList.remove('hidden');
  workspaceTitle.textContent = title;
  workspaceSubtitle.textContent = subtitle;
}

navStatus.addEventListener('click', () => {
  switchTab(navStatus, secStatus, 'Local Server Setup', 'SecOps Gateway Control');
});

navFirewall.addEventListener('click', () => {
  switchTab(navFirewall, secFirewall, 'AST Firewall Settings', 'Deterministic Rules Control');
});

navLogs.addEventListener('click', () => {
  switchTab(navLogs, secLogs, 'Telemetry Query Logs', 'Live Threat Intercept Monitor');
});

// ----------------------------------------------------
// CONFIG LOADED & LICENSE SYNCED CALLBACKS
// ----------------------------------------------------
window.adminzeroApi.onConfigLoaded((config) => {
  inputLicense.value = config.licenseKey || '';
  inputDialect.value = config.dbDialect || 'postgres';
  inputUri.value = config.dbUri || '';
  inputApiKey.value = config.geminiApiKey || '';
  inputBlocked.value = config.blockedTables || '';
  inputReadOnly.checked = config.enforceReadOnly !== false;
  
  localQueryCount = config.queryCount || 0;
  localMaxQueries = config.maxQueries || 500;
  
  updateQuotaUI();
});

window.adminzeroApi.onLicenseSynced((data) => {
  licenseBadge.textContent = data.tier;
  if (data.active) {
    licenseBadge.className = "px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase";
    statusDot.className = "h-2 w-2 rounded-full bg-emerald-500 animate-pulse";
    statusText.textContent = "Gateway Operational";
  } else {
    licenseBadge.className = "px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase";
    statusDot.className = "h-2 w-2 rounded-full bg-red-500";
    statusText.textContent = "Gateway Deactivated (No Credits)";
  }
  
  localMaxQueries = localQueryCount + data.creditsRemaining;
  updateQuotaUI();
});

function updateQuotaUI() {
  creditsText.textContent = `${localQueryCount} / ${localMaxQueries} queries used`;
  const pct = Math.min(100, Math.round((localQueryCount / Math.max(1, localMaxQueries)) * 100));
  creditsBar.style.width = `${pct}%`;
  if (pct > 90) {
    creditsBar.className = "h-full bg-red-500 rounded-full transition-all duration-300";
  } else if (pct > 65) {
    creditsBar.className = "h-full bg-yellow-500 rounded-full transition-all duration-300";
  } else {
    creditsBar.className = "h-full bg-emerald-500 rounded-full transition-all duration-300";
  }
}

// ----------------------------------------------------
// CONNECTION ACTIONS
// ----------------------------------------------------
configForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage('Saving settings...', 'info');
  
  const success = await window.adminzeroApi.saveConfig({
    licenseKey: inputLicense.value,
    dbDialect: inputDialect.value,
    dbUri: inputUri.value,
    geminiApiKey: inputApiKey.value,
    blockedTables: inputBlocked.value,
    enforceReadOnly: inputReadOnly.checked
  });
  
  if (success) {
    showMessage('Configuration saved and synced successfully.', 'success');
  } else {
    showMessage('Error saving configuration.', 'error');
  }
});

btnSaveRules.addEventListener('click', async () => {
  showMessage('Applying firewall rules...', 'info');
  const success = await window.adminzeroApi.saveConfig({
    enforceReadOnly: inputReadOnly.checked,
    blockedTables: inputBlocked.value
  });
  if (success) {
    showMessage('AST firewall rules applied successfully.', 'success');
  } else {
    showMessage('Error applying rules.', 'error');
  }
});

btnTest.addEventListener('click', async () => {
  if (!inputUri.value) {
    showMessage('Enter a database URI connection string first.', 'error');
    return;
  }
  showMessage('Testing connection...', 'info');
  
  const result = await window.adminzeroApi.testConnection(inputDialect.value, inputUri.value);
  if (result.success) {
    showMessage('Database connection verified successfully!', 'success');
  } else {
    showMessage(`Connection failed: ${result.error}`, 'error');
  }
});

btnSync.addEventListener('click', async () => {
  showMessage('Syncing key status with cloud...', 'info');
  const data = await window.adminzeroApi.syncLicense();
  localQueryCount = data.queryCount;
  localMaxQueries = data.maxQueries;
  updateQuotaUI();
  
  if (data.active) {
    showMessage('License key sync complete. Gateway active.', 'success');
  } else {
    showMessage('License inactive or depleted. Top up at glitchgo.vercel.app/portal.', 'error');
  }
});

function showMessage(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = "p-3.5 rounded-xl text-xs font-mono border block ";
  if (type === 'success') {
    statusMessage.className += "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  } else if (type === 'error') {
    statusMessage.className += "bg-red-500/10 border-red-500/30 text-red-400";
  } else {
    statusMessage.className += "bg-slate-900 border-slate-800 text-slate-400";
  }
  
  setTimeout(() => {
    statusMessage.className = "hidden";
  }, 4000);
}

// ----------------------------------------------------
// LIVE LOG STREAM TABLE APPENDER
// ----------------------------------------------------
let logs = [];
window.adminzeroApi.onNewQueryLog((log) => {
  logs.unshift(log);
  if (logs.length > 50) logs.pop();
  
  // Increment counter in UI
  if (log.status === 'success') {
    localQueryCount += 1;
    updateQuotaUI();
  }
  
  renderLogs();
});

function renderLogs() {
  if (logs.length === 0) {
    logsTbody.innerHTML = `
      <tr>
        <td colSpan="4" class="p-8 text-center text-slate-500 italic">
          Awaiting query logs... Set up database connection and route queries to port 5001.
        </td>
      </tr>
    `;
    return;
  }
  
  logsTbody.innerHTML = logs.map(log => `
    <tr class="border-b border-slate-850 hover:bg-slate-900/30">
      <td class="p-3 text-slate-500 whitespace-nowrap">${new Date(log.timestamp).toLocaleTimeString()}</td>
      <td class="p-3 text-slate-350 max-w-[200px] truncate select-all" title="${log.prompt}">${log.prompt}</td>
      <td class="p-3 text-indigo-400 max-w-[250px] truncate select-all" title="${log.sql}">${log.sql || 'N/A'}</td>
      <td class="p-3 whitespace-nowrap">
        ${log.status === 'success' ? `
          <span class="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
            success
          </span>
        ` : `
          <span class="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]" title="${log.details}">
            blocked
          </span>
        `}
      </td>
    </tr>
  `).join('');
}
