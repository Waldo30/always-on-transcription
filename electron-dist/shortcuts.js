"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerToggleShortcut = registerToggleShortcut;
exports.unregisterAllShortcuts = unregisterAllShortcuts;
var electron_1 = require("electron");
function registerToggleShortcut(getWindow) {
    var registered = electron_1.globalShortcut.register("CommandOrControl+Shift+R", function () {
        var win = getWindow();
        if (win && !win.isDestroyed()) {
            win.webContents.send("toggle-recording");
        }
    });
    return registered;
}
function unregisterAllShortcuts() {
    electron_1.globalShortcut.unregisterAll();
}
