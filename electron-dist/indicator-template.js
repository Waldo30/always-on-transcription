"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderIndicatorHtml = renderIndicatorHtml;
function renderIndicatorHtml(state, colors) {
    const c = colors[state];
    const circleBg = state === "recording" ? "#ef4444" : "#ffffff";
    const iconDot = state === "recording" ? `<div class="dot pulse"></div>`
        : state === "processing" ? `<div class="spinner"></div>`
            : state === "saved" ? `<svg class="svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" ry="2"/><rect x="4" y="4" width="12" height="12" rx="2" ry="2"/></svg>`
                : `<div class="mic"></div>`;
    return `<!doctype html><html><head><meta charset="utf-8"/><style>
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
    <div class="outer">
      <div class="circle">
        <div class="ring"></div>
        ${iconDot}
        <div class="label">${c.text}</div>
      </div>
    </div>
  </body></html>`;
}
