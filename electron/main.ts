import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'

// --- 身份与持久化同步核心配置 ---
const APP_NAME = 'YuToys'
const APP_ID = 'com.yu.yutoys'

// 强制统一应用名称与 AppID，确保 .bat 与 .exe 共享 AppData 目录
app.name = APP_NAME
app.setAppUserModelId(APP_ID)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// 使用标准化的路径获取方式
const getResourcePath = (relativePath: string) => {
  const isDev = !app.isPackaged
  if (isDev) {
    return path.join(app.getAppPath(), 'public', relativePath)
  }
  // 在打包环境下，资源位于 asar 内部的 public 目录
  return path.join(app.getAppPath(), 'public', relativePath)
}

const configPath = path.join(app.getPath('userData'), 'window-state.json')

function loadWindowState() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch (e) { /* ignore */ }
  return { x: undefined, y: undefined }
}

function saveWindowState() {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  try {
    fs.writeFileSync(configPath, JSON.stringify({ x: bounds.x, y: bounds.y }))
  } catch (e) { /* ignore */ }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  function createTray() {
    // 采用原生 .ico 适配 Windows 托盘，这是解决图标消失的最稳妥路径
    const iconPath = getResourcePath('icon.ico')

    if (fs.existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath)
      tray = new Tray(icon)
    } else {
      // 备选路径搜索
      const fallbackPath = path.join(process.resourcesPath, 'public/icon.ico')
      if(fs.existsSync(fallbackPath)) {
        tray = new Tray(nativeImage.createFromPath(fallbackPath))
      } else {
        tray = new Tray(nativeImage.createEmpty())
      }
    }

    if (tray) {
      const contextMenu = Menu.buildFromTemplate([
        { label: '显示界面', click: () => mainWindow?.show() },
        { type: 'separator' },
        { label: '退出程序', click: () => app.quit() }
      ])
      tray.setToolTip(APP_NAME)
      tray.setContextMenu(contextMenu)
      tray.on('click', () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
        }
      })
    }
  }

  function createWindow() {
    const state = loadWindowState()
    const appIconPath = getResourcePath('icon.ico')

    mainWindow = new BrowserWindow({
      width: 320,
      height: 480,
      x: state.x,
      y: state.y,
      minWidth: 320,
      minHeight: 480,
      maxWidth: 320,
      maxHeight: 480,
      icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: false,
      show: false,
      autoHideMenuBar: true,
      skipTaskbar: true,
      backgroundColor: '#00000000',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show()
    })

    mainWindow.on('move', saveWindowState)
    mainWindow.on('close', saveWindowState)
    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.whenReady().then(() => {
    createWindow()
    createTray()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize()
  })

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close()
  })

  ipcMain.on('set-always-on-top', (event, flag) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(flag)
  })

  ipcMain.on('show-notification', (event, { title, body }) => {
    new Notification({ 
      title: title || APP_NAME, 
      body, 
      silent: true 
    }).show()
  })

  ipcMain.on('set-auto-start', (event, flag) => {
    // 只有在打包环境下才执行真实的快捷启动设置，避免 dev 环境干扰系统列表
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: flag,
        path: app.getPath('exe'),
      })
    }
  })
}
