const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged; // Check if we are in dev mode
const fs = require('fs');

function resolveIconPath() {
  const base = path.join(__dirname, '../assets');
  if (process.platform === 'win32') {
    const p = path.join(base, 'nextlib.ico');
    return fs.existsSync(p) ? p : undefined;
  }
  if (process.platform === 'darwin') {
    const p = path.join(base, 'nextlib.icns');
    return fs.existsSync(p) ? p : undefined;
  }
  const p = path.join(base, 'nextlib.png');
  return fs.existsSync(p) ? p : undefined;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    fullscreen: false,
    resizable: true,
    fullscreenable: true,
    icon: resolveIconPath(),
    webPreferences: {
      nodeIntegration: false, // Security: keep false
      contextIsolation: true, // Security: keep true
      preload: path.join(__dirname, 'preload.js')
    }
  });
    win.maximize();
    win.setAspectRatio(16 / 9);
    // Hide the menu bar
    // win.setMenuBarVisibility(false);
    // win.setMenu(null);

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F11') {
        win.setFullScreen(!win.isFullScreen());
        event.preventDefault();
      }
      if (input.key === 'Escape' && win.isFullScreen()) {
        win.setFullScreen(false);
        event.preventDefault();
      }
    }
  });

  if (isDev) {
    // Load Vite dev server
    win.loadURL('http://localhost:5173'); 
    // win.webContents.openDevTools(); // Open console for debugging
  } else {
    // Load built React files in production
    // win.loadFile(path.join(__dirname, '../dist/index.html'));
    win.loadURL('https://nextlib-desktop-admin.vercel.app/'); 
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
