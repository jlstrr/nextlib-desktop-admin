const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Allow React to ask Node to login or save a token securely
  saveToken: (token) => ipcRenderer.send('save-token', token),
  exportReportPDF: (payload) => ipcRenderer.invoke('export-report-pdf', payload),
  printReport: (payload) => ipcRenderer.invoke('print-report', payload),
});
