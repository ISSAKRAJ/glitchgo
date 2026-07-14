const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('adminzeroApi', {
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  testConnection: (dialect, uri) => ipcRenderer.invoke('test-connection', { dialect, uri }),
  syncLicense: () => ipcRenderer.invoke('sync-license-now'),
  
  onConfigLoaded: (callback) => {
    ipcRenderer.on('config-loaded', (event, data) => callback(data));
  },
  
  onLicenseSynced: (callback) => {
    ipcRenderer.on('license-synced', (event, data) => callback(data));
  },
  
  onNewQueryLog: (callback) => {
    ipcRenderer.on('new-query-log', (event, data) => callback(data));
  }
});
