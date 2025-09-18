const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example methods for future IPC communication
  // You can add specific methods here as needed for your transcription app
  
  // Example: Send message to main process
  send: (channel, data) => {
    // Whitelist channels for security
    let validChannels = ['start-transcription', 'stop-transcription', 'get-settings'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Example: Receive message from main process
  receive: (channel, func) => {
    let validChannels = ['transcription-result', 'settings-updated'];
    if (validChannels.includes(channel)) {
      // Remove all listeners for this channel before adding new one
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Example: Send message and wait for response
  invoke: (channel, data) => {
    let validChannels = ['get-app-version', 'save-settings'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
