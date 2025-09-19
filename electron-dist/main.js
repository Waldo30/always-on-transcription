"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var path_1 = __importDefault(require("path"));
var mainWindow;
var indicatorWindow = null;
var indicatorTimer = null;
function renderIndicator(state) {
    var workArea = electron_1.screen.getPrimaryDisplay().workArea;
    var width = 96;
    var height = 96;
    var margin = 16;
    var x = Math.max(workArea.x + workArea.width - width - margin, workArea.x + margin);
    var y = Math.max(workArea.y + workArea.height - height - margin, workArea.y + margin);
    if (!indicatorWindow || indicatorWindow.isDestroyed()) {
        indicatorWindow = new electron_1.BrowserWindow({
            width: width,
            height: height,
            x: x,
            y: y,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            focusable: false,
            show: false,
            useContentSize: true,
            backgroundColor: "#00000000",
        });
    }
    else {
        indicatorWindow.setBounds({ x: x, y: y, width: width, height: height });
    }
    var colors = {
        idle: { ring: "#e2e8f0", icon: "#64748b", text: "Press to start" },
        recording: { ring: "#dc2626", icon: "#ffffff", text: "Recording" },
        processing: { ring: "#0ea5e9", icon: "#38bdf8", text: "Processing" },
        saved: { ring: "#16a34a", icon: "#22c55e", text: "Saved" },
    };
    var c = colors[state];
    var circleBg = state === "recording" ? "#ef4444" : "#ffffff";
    var iconDot = state === "recording" ? "<div class=\"dot pulse\"></div>"
        : state === "processing" ? "<div class=\"spinner\"></div>"
            : state === "saved" ? "<svg class=\"svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"9\" y=\"9\" width=\"12\" height=\"12\" rx=\"2\" ry=\"2\"/><rect x=\"4\" y=\"4\" width=\"12\" height=\"12\" rx=\"2\" ry=\"2\"/></svg>"
                : "<div class=\"mic\"></div>";
    var html = "<!doctype html><html><head><meta charset=\"utf-8\"/><style>\n  html,body{margin:0;padding:0;background:transparent;overflow:hidden;width:100%;height:100%}\n  .outer{width:100%;height:100%;display:flex;align-items:center;justify-content:center}\n  .circle{width:64px;height:64px;border-radius:9999px;background:".concat(circleBg, ";box-shadow:0 6px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;position:relative}\n  .ring{position:absolute;inset:-3px;border-radius:9999px;border:3px solid ").concat(c.ring, ";}\n  .mic{width:20px;height:28px;border:3px solid ").concat(c.icon, ";border-top-left-radius:12px;border-top-right-radius:12px;border-bottom:none;position:relative}\n  .mic:after{content:'';position:absolute;left:50%;transform:translateX(-50%);bottom:-10px;width:24px;height:3px;background:").concat(c.icon, ";border-radius:2px}\n  .dot{width:12px;height:12px;border-radius:9999px;background:").concat(c.icon, "}\n  .pulse{animation:pulse 1s infinite ease-in-out}\n  @keyframes pulse{0%,100%{transform:scale(.9)}50%{transform:scale(1.1)}}\n  .spinner{width:20px;height:20px;border:3px solid rgba(100,116,139,.35);border-top-color:").concat(c.icon, ";border-radius:9999px;animation:spin 1s linear infinite}\n  @keyframes spin{to{transform:rotate(360deg)}}\n  .svg{width:22px;height:22px;stroke:").concat(c.icon, ";fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n  .label{display:none}\n  </style></head><body>\n    <div class=\"outer\">\n      <div class=\"circle\">\n        <div class=\"ring\"></div>\n        ").concat(iconDot, "\n        <div class=\"label\">").concat(c.text, "</div>\n      </div>\n    </div>\n  </body></html>");
    indicatorWindow.loadURL("data:text/html;charset=UTF-8,".concat(encodeURIComponent(html)));
    indicatorWindow.showInactive();
}
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
    var registered = electron_1.globalShortcut.register("CommandOrControl+Shift+R", function () {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("toggle-recording");
        }
    });
    if (!registered) {
        console.error("Global shortcut registration failed");
    }
    electron_1.ipcMain.on("start-transcription", function () {
        renderIndicator("recording");
    });
    electron_1.ipcMain.on("processing-started", function () {
        renderIndicator("processing");
    });
    electron_1.ipcMain.on("stop-transcription", function () {
        renderIndicator("processing");
    });
    electron_1.ipcMain.on("copy-to-clipboard", function (_evt, text) {
        try {
            electron_1.clipboard.writeText(String(text !== null && text !== void 0 ? text : ""));
            renderIndicator("saved");
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("transcription-saved");
            }
            if (indicatorTimer)
                clearTimeout(indicatorTimer);
            indicatorTimer = setTimeout(function () {
                if (indicatorWindow && !indicatorWindow.isDestroyed()) {
                    indicatorWindow.hide();
                }
            }, 1500);
        }
        catch (_a) { }
    });
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
