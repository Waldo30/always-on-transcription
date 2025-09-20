import { BrowserWindow, screen } from "electron";
import { renderIndicatorHtml } from "./indicator-template";

export type IndicatorState = "idle" | "recording" | "processing" | "saved";

let indicatorWindow: BrowserWindow | null = null;

export function renderIndicator(state: IndicatorState) {
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
  const html = renderIndicatorHtml(state, colors);

  indicatorWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  indicatorWindow.showInactive();
}

export function hideIndicator() {
  if (indicatorWindow && !indicatorWindow.isDestroyed()) {
    indicatorWindow.hide();
  }
}


