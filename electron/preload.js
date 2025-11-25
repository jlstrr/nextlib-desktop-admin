const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Allow React to ask Node to login or save a token securely
  saveToken: (token) => ipcRenderer.send('save-token', token),
  // You can add more system interactions here
});