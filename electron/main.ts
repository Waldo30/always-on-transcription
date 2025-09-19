import { app, BrowserWindow, globalShortcut } from "electron";
import isDev from "electron-is-dev";
import path from "path";

let mainWindow: BrowserWindow | null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const loadURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  win.loadURL(loadURL);
  mainWindow = win;
}

app.whenReady().then(() => {
  createWindow();

  // Register global shortcut to toggle recording
  const registered = globalShortcut.register("CommandOrControl+Shift+R", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("toggle-recording");
    }
  });

  if (!registered) {
    console.error("Global shortcut registration failed");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
