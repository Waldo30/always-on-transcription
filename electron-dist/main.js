"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var path_1 = __importDefault(require("path"));
var mainWindow;
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    var loadURL = electron_is_dev_1.default
        ? "http://localhost:3000"
        : "file://".concat(path_1.default.join(__dirname, "../out/index.html"));
    win.loadURL(loadURL);
    mainWindow = win;
}
electron_1.app.whenReady().then(function () {
    createWindow();
    // Register global shortcut to toggle recording
    var registered = electron_1.globalShortcut.register("CommandOrControl+Shift+R", function () {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("toggle-recording");
        }
    });
    if (!registered) {
        console.error("Global shortcut registration failed");
    }
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.on("will-quit", function () {
    electron_1.globalShortcut.unregisterAll();
});
