import { app, BrowserWindow, ipcMain, clipboard } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import { renderIndicator, hideIndicator } from "./indicator";
import { registerToggleShortcut, unregisterAllShortcuts } from "./shortcuts";

let mainWindow: BrowserWindow | null;
let indicatorTimer: NodeJS.Timeout | null = null;

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

  const registered = registerToggleShortcut(() => mainWindow ?? null);

  if (!registered) {
    console.error("Global shortcut registration failed");
  }

  ipcMain.on("start-transcription", () => {
    renderIndicator("recording");
  });

  ipcMain.on("processing-started", () => {
    renderIndicator("processing");
  });

  ipcMain.on("stop-transcription", () => {
    renderIndicator("processing");
  });

  ipcMain.on("copy-to-clipboard", (_evt, text: unknown) => {
    try {
      clipboard.writeText(String(text ?? ""));
      renderIndicator("saved");
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("transcription-saved");
      }
      if (indicatorTimer) clearTimeout(indicatorTimer);
      indicatorTimer = setTimeout(() => {
        hideIndicator();
      }, 1500);
    } catch {}
  });
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
  unregisterAllShortcuts();
});
