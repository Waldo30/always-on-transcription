"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const path_1 = __importDefault(require("path"));
const indicator_1 = require("./indicator");
const shortcuts_1 = require("./shortcuts");
let mainWindow;
let indicatorTimer = null;
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    const loadURL = electron_is_dev_1.default
        ? "http://localhost:3000"
        : `file://${path_1.default.join(__dirname, "../out/index.html")}`;
    win.loadURL(loadURL);
    mainWindow = win;
}
electron_1.app.whenReady().then(() => {
    createWindow();
    const registered = (0, shortcuts_1.registerToggleShortcut)(() => mainWindow !== null && mainWindow !== void 0 ? mainWindow : null);
    if (!registered) {
        console.error("Global shortcut registration failed");
    }
    electron_1.ipcMain.on("start-transcription", () => {
        (0, indicator_1.renderIndicator)("recording");
    });
    electron_1.ipcMain.on("processing-started", () => {
        (0, indicator_1.renderIndicator)("processing");
    });
    electron_1.ipcMain.on("stop-transcription", () => {
        (0, indicator_1.renderIndicator)("processing");
    });
    electron_1.ipcMain.on("copy-to-clipboard", (_evt, text) => {
        try {
            electron_1.clipboard.writeText(String(text !== null && text !== void 0 ? text : ""));
            (0, indicator_1.renderIndicator)("saved");
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("transcription-saved");
            }
            if (indicatorTimer)
                clearTimeout(indicatorTimer);
            indicatorTimer = setTimeout(() => {
                (0, indicator_1.hideIndicator)();
            }, 1500);
        }
        catch { }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.on("will-quit", () => {
    (0, shortcuts_1.unregisterAllShortcuts)();
});
