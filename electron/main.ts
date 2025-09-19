import { app, BrowserWindow, globalShortcut, ipcMain, screen, clipboard } from "electron";
import isDev from "electron-is-dev";
import path from "path";

let mainWindow: BrowserWindow | null;
let indicatorWindow: BrowserWindow | null = null;
let indicatorTimer: NodeJS.Timeout | null = null;

type IndicatorState = "idle" | "recording" | "processing" | "saved";

function renderIndicator(state: IndicatorState) {
  const workArea = screen.getPrimaryDisplay().workArea;
  const width = 96;
  const height = 96;
  const margin = 16;
  const x = Math.max(workArea.x + workArea.width - width - margin, workArea.x + margin);
  const y = Math.max(workArea.y + workArea.height - height - margin, workArea.y + margin);

  if (!indicatorWindow || indicatorWindow.isDestroyed()) {
    indicatorWindow = new BrowserWindow({
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
  } else {
    indicatorWindow.setBounds({ x, y, width, height });
  }

  const colors = {
    idle: { ring: "#e2e8f0", icon: "#64748b", text: "Press to start" },
    recording: { ring: "#dc2626", icon: "#ffffff", text: "Recording" },
    processing: { ring: "#0ea5e9", icon: "#38bdf8", text: "Processing" },
    saved: { ring: "#16a34a", icon: "#22c55e", text: "Saved" },
  } as const;
  const c = colors[state];
  const circleBg = state === "recording" ? "#ef4444" : "#ffffff";

  const iconDot = state === "recording" ? `<div class=\"dot pulse\"></div>`
    : state === "processing" ? `<div class=\"spinner\"></div>`
    : state === "saved" ? `<svg class=\"svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"9\" y=\"9\" width=\"12\" height=\"12\" rx=\"2\" ry=\"2\"/><rect x=\"4\" y=\"4\" width=\"12\" height=\"12\" rx=\"2\" ry=\"2\"/></svg>`
    : `<div class=\"mic\"></div>`;

  const html = `<!doctype html><html><head><meta charset=\"utf-8\"/><style>
  html,body{margin:0;padding:0;background:transparent;overflow:hidden;width:100%;height:100%}
  .outer{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
  .circle{width:64px;height:64px;border-radius:9999px;background:${circleBg};box-shadow:0 6px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;position:relative}
  .ring{position:absolute;inset:-3px;border-radius:9999px;border:3px solid ${c.ring};}
  .mic{width:20px;height:28px;border:3px solid ${c.icon};border-top-left-radius:12px;border-top-right-radius:12px;border-bottom:none;position:relative}
  .mic:after{content:'';position:absolute;left:50%;transform:translateX(-50%);bottom:-10px;width:24px;height:3px;background:${c.icon};border-radius:2px}
  .dot{width:12px;height:12px;border-radius:9999px;background:${c.icon}}
  .pulse{animation:pulse 1s infinite ease-in-out}
  @keyframes pulse{0%,100%{transform:scale(.9)}50%{transform:scale(1.1)}}
  .spinner{width:20px;height:20px;border:3px solid rgba(100,116,139,.35);border-top-color:${c.icon};border-radius:9999px;animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .svg{width:22px;height:22px;stroke:${c.icon};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .label{display:none}
  </style></head><body>
    <div class=\"outer\">
      <div class=\"circle\">
        <div class=\"ring\"></div>
        ${iconDot}
        <div class=\"label\">${c.text}</div>
      </div>
    </div>
  </body></html>`;

  indicatorWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  indicatorWindow.showInactive();
}

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

  // Show indicator on renderer start/stop events
  ipcMain.on("start-transcription", () => {
    renderIndicator("recording");
  });

  ipcMain.on("processing-started", () => {
    renderIndicator("processing");
  });

  ipcMain.on("stop-transcription", () => {
    // Transition to processing immediately so there is no visual gap
    renderIndicator("processing");
  });

  // Allow renderer to request a native clipboard write and confirm success
  ipcMain.on("copy-to-clipboard", (_evt, text: unknown) => {
    try {
      clipboard.writeText(String(text ?? ""));
      renderIndicator("saved");
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("transcription-saved");
      }
      if (indicatorTimer) clearTimeout(indicatorTimer);
      indicatorTimer = setTimeout(() => {
        if (indicatorWindow && !indicatorWindow.isDestroyed()) {
          indicatorWindow.hide();
        }
      }, 1500);
    } catch {
      // ignore
    }
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
  globalShortcut.unregisterAll();
});
