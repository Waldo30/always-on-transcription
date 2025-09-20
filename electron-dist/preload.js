"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendChannels = [
    "start-transcription",
    "processing-started",
    "stop-transcription",
    "transcription-saved",
    "copy-to-clipboard",
    "get-settings",
];
const receiveChannels = [
    "transcription-result",
    "settings-updated",
    "toggle-recording",
];
const invokeChannels = [
    "get-app-version",
    "save-settings",
];
const api = {
    send: (channel, data) => {
        if (sendChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        if (receiveChannels.includes(channel)) {
            electron_1.ipcRenderer.removeAllListeners(channel);
            electron_1.ipcRenderer.on(channel, (_event, ...args) => func(...args));
        }
    },
    invoke: (channel, data) => {
        if (invokeChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, data);
        }
    },
    writeClipboard: (text) => {
        try {
            electron_1.clipboard.writeText(String(text !== null && text !== void 0 ? text : ""));
            return true;
        }
        catch (e) {
            // keep console to avoid dependency coupling here
            // eslint-disable-next-line no-console
            console.error("Native clipboard write failed", e);
            return false;
        }
    },
};
electron_1.contextBridge.exposeInMainWorld("electronAPI", api);
