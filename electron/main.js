const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged; // Check if we are in dev mode

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // Security: keep false
      contextIsolation: true, // Security: keep true
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    // Load Vite dev server
    win.loadURL('http://localhost:5173'); 
    win.webContents.openDevTools(); // Open console for debugging
  } else {
    // Load built React files in production
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});