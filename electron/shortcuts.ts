import { BrowserWindow, globalShortcut } from "electron";

export function registerToggleShortcut(getWindow: () => BrowserWindow | null) {
  const registered = globalShortcut.register("CommandOrControl+Shift+R", () => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send("toggle-recording");
    }
  });
  return registered;
}

export function unregisterAllShortcuts() {
  globalShortcut.unregisterAll();
}


