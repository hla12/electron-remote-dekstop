const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

// Handle the request for screen sources from the renderer process
ipcMain.handle('get-screen-sources', async () => {
  return await desktopCapturer.getSources({ types: ['screen'] });
});

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
