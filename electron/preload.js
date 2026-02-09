const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  showNotification: (payload) => ipcRenderer.send('show-notification', payload),
  setAutoStart: (flag) => ipcRenderer.send('set-auto-start', flag),
  onHourlySound: (callback) => ipcRenderer.on('trigger-hourly-sound', callback)
})
