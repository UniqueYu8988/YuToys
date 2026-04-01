export {}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      close: () => void
      setAlwaysOnTop: (flag: boolean) => void
      showNotification: (payload: { title: string; body: string }) => void
      setAutoStart: (flag: boolean) => void
      setSkipTaskbar: (flag: boolean) => void
      openExternal: (url: string) => void
      onHourlySound: (callback: () => void) => void
    }
  }
}
