const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const mode = process.argv.includes('--viewer') ? 'viewer.html' : 'host.html';
  win.loadFile(path.join(__dirname, 'renderer', mode));
}

app.whenReady().then(createWindow);
