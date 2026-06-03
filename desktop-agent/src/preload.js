const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agent', {
  // System
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),

  // Screen lock
  lockScreen: () => ipcRenderer.invoke('lock-screen'),
  unlockScreen: () => ipcRenderer.invoke('unlock-screen'),

  // Events from main process
  onSystemStats: (callback) => {
    ipcRenderer.on('system:stats', (_event, data) => callback(data));
  },
  onSessionStart: (callback) => {
    ipcRenderer.on('session:start', (_event, data) => callback(data));
  },
  onSessionEnd: (callback) => {
    ipcRenderer.on('session:end', () => callback());
  },
  onSessionWarning: (callback) => {
    ipcRenderer.on('session:warning', (_event, data) => callback(data));
  },
  onPopupMessage: (callback) => {
    ipcRenderer.on('popup:message', (_event, data) => callback(data));
  },
  onAgentConfig: (callback) => {
    ipcRenderer.on('agent:config', (_event, data) => callback(data));
  },
});
