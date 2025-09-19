const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    let validChannels = ['start-transcription', 'processing-started', 'stop-transcription', 'transcription-saved', 'copy-to-clipboard', 'get-settings'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel, func) => {
    let validChannels = ['transcription-result', 'settings-updated', 'toggle-recording'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  invoke: (channel, data) => {
    let validChannels = ['get-app-version', 'save-settings'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },

  writeClipboard: (text) => {
    try {
      clipboard.writeText(String(text ?? ''));
      return true;
    } catch (e) {
      console.error('Native clipboard write failed', e);
      return false;
    }
  }
});
