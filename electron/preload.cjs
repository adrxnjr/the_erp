const { contextBridge, ipcRenderer } = require('electron');

// Secure Preload Bridge
// contextIsolation: true and nodeIntegration: false ensure the renderer cannot access Node.js internals.
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:get-version'),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Native Utilities
  printDocument: () => ipcRenderer.send('app:print'),
  openExternal: (url) => ipcRenderer.send('app:open-external', url),
});
