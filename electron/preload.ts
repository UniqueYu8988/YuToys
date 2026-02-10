import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('set-always-on-top', flag),
  showNotification: (payload: { title: string; body: string }) => ipcRenderer.send('show-notification', payload),
  setAutoStart: (flag: boolean) => ipcRenderer.send('set-auto-start', flag),
  setSkipTaskbar: (flag: boolean) => ipcRenderer.send('set-skip-taskbar', flag),
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  onHourlySound: (callback: () => void) => ipcRenderer.on('trigger-hourly-sound', () => callback())
})
