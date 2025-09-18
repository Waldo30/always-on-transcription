"use strict";
var _a = require("electron"), app = _a.app, BrowserWindow = _a.BrowserWindow;
var isDev = require("electron-is-dev");
var path = require("path");
function createWindow() {
    var win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    var loadURL = isDev
        ? "http://localhost:3000"
        : "file://".concat(path.join(__dirname, "../out/index.html"));
    win.loadURL(loadURL);
}
app.whenReady().then(createWindow);
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
