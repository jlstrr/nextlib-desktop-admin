const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

function buildDataUrlFromHtml(html) {
  const base64 = Buffer.from(String(html || ''), 'utf8').toString('base64');
  return `data:text/html;base64,${base64}`;
}

async function waitForDocumentReady(webContents) {
  await webContents.executeJavaScript(
    `
      new Promise((resolve) => {
        const done = () => resolve(true);
        if (document.readyState === 'complete') return done();
        window.addEventListener('load', done, { once: true });
      })
    `,
    true
  );
  await webContents.executeJavaScript(
    `
      new Promise((resolve) => {
        const imgs = Array.from(document.images || []);
        const pending = imgs.filter((img) => !img.complete);
        if (pending.length === 0) return resolve(true);
        let finished = 0;
        const done = () => {
          finished += 1;
          if (finished >= pending.length) resolve(true);
        };
        pending.forEach((img) => {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
        setTimeout(() => resolve(true), 2000);
      })
    `,
    true
  );
}

ipcMain.handle('export-report-pdf', async (event, payload) => {
  const html = payload?.html;
  const suggestedFileName = payload?.suggestedFileName;
  const parent = BrowserWindow.fromWebContents(event.sender);
  const win = new BrowserWindow({
    show: false,
    parent: parent || undefined,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false
    }
  });
  try {
    await win.loadURL(buildDataUrlFromHtml(html));
    await waitForDocumentReady(win.webContents);
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4'
    });
    const defaultPath = path.join(app.getPath('documents'), String(suggestedFileName || 'report.pdf'));
    const { canceled, filePath } = await dialog.showSaveDialog(parent || win, {
      title: 'Save Report as PDF',
      defaultPath,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (canceled || !filePath) return { ok: true, canceled: true };
    await fs.promises.writeFile(filePath, pdfBuffer);
    return { ok: true, canceled: false, filePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Export failed' };
  } finally {
    win.close();
  }
});

ipcMain.handle('print-report', async (event, payload) => {
  const html = payload?.html;
  const parent = BrowserWindow.fromWebContents(event.sender);
  const win = new BrowserWindow({
    show: false,
    parent: parent || undefined,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false
    }
  });
  try {
    await win.loadURL(buildDataUrlFromHtml(html));
    await waitForDocumentReady(win.webContents);
    const result = await new Promise((resolve) => {
      win.webContents.print(
        {
          silent: false,
          printBackground: true
        },
        (success, failureReason) => {
          resolve({ success, failureReason });
        }
      );
    });
    if (!result.success) return { ok: false, error: result.failureReason || 'Print failed' };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Print failed' };
  } finally {
    win.close();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
