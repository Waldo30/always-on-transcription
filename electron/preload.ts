import { contextBridge, ipcRenderer, clipboard } from "electron";

const sendChannels = [
  "start-transcription",
  "processing-started",
  "stop-transcription",
  "transcription-saved",
  "copy-to-clipboard",
  "get-settings",
] as const;
type SendChannel = typeof sendChannels[number];

const receiveChannels = [
  "transcription-result",
  "settings-updated",
  "toggle-recording",
] as const;
type ReceiveChannel = typeof receiveChannels[number];

const invokeChannels = [
  "get-app-version",
  "save-settings",
] as const;
type InvokeChannel = typeof invokeChannels[number];

export type ElectronAPI = {
  send: (channel: SendChannel, data?: unknown) => void;
  receive: (channel: ReceiveChannel, func: (...args: unknown[]) => void) => void;
  invoke: (channel: InvokeChannel, data?: unknown) => Promise<unknown> | undefined;
  writeClipboard: (text: string) => boolean;
};

const api: ElectronAPI = {
  send: (channel, data) => {
    if ((sendChannels as readonly string[]).includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if ((receiveChannels as readonly string[]).includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  invoke: (channel, data) => {
    if ((invokeChannels as readonly string[]).includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  writeClipboard: (text) => {
    try {
      clipboard.writeText(String(text ?? ""));
      return true;
    } catch (e) {
      // keep console to avoid dependency coupling here
      // eslint-disable-next-line no-console
      console.error("Native clipboard write failed", e);
      return false;
    }
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);


