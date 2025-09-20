"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderIndicator = renderIndicator;
exports.hideIndicator = hideIndicator;
const electron_1 = require("electron");
const indicator_template_1 = require("./indicator-template");
let indicatorWindow = null;
function renderIndicator(state) {
    const workArea = electron_1.screen.getPrimaryDisplay().workArea;
    const width = 96;
    const height = 96;
    const margin = 16;
    const x = Math.max(workArea.x + workArea.width - width - margin, workArea.x + margin);
    const y = Math.max(workArea.y + workArea.height - height - margin, workArea.y + margin);
    if (!indicatorWindow || indicatorWindow.isDestroyed()) {
        indicatorWindow = new electron_1.BrowserWindow({
            width,
            height,
            x,
            y,
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
        indicatorWindow.setBounds({ x, y, width, height });
    }
    const colors = {
        idle: { ring: "#e2e8f0", icon: "#64748b", text: "Press to start" },
        recording: { ring: "#dc2626", icon: "#ffffff", text: "Recording" },
        processing: { ring: "#0ea5e9", icon: "#38bdf8", text: "Processing" },
        saved: { ring: "#16a34a", icon: "#22c55e", text: "Saved" },
    };
    const html = (0, indicator_template_1.renderIndicatorHtml)(state, colors);
    indicatorWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
    indicatorWindow.showInactive();
}
function hideIndicator() {
    if (indicatorWindow && !indicatorWindow.isDestroyed()) {
        indicatorWindow.hide();
    }
}
