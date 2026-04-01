import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  screen,
} from "electron";
import path from "path";
import fs from "fs";

// --- 身份与持久化同步核心配置 ---
const APP_NAME = "YuToys";
const APP_ID = "YuToys";
const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";

// 强制统一应用名称与 AppID，确保 .bat 与 .exe 共享 AppData 目录
app.name = APP_NAME;
if (isWindows) {
  app.setAppUserModelId(APP_ID);
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const findResourcePath = (relativePaths: string[]) => {
  const searchRoots = [app.getAppPath(), process.resourcesPath];

  for (const root of searchRoots) {
    for (const relativePath of relativePaths) {
      const candidate = path.join(root, "public", relativePath);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

const getTrayImage = () => {
  const trayPath = isMac
    ? findResourcePath(["tray.png", "iconTemplate.png", "icon.png"])
    : findResourcePath(["icon.ico", "icon.png"]);

  if (!trayPath) {
    return nativeImage.createEmpty();
  }

  const image = nativeImage.createFromPath(trayPath);
  if (isMac) {
    image.setTemplateImage(true);
  }
  return image;
};

const getWindowIconPath = () =>
  findResourcePath(isWindows ? ["icon.ico", "icon.png"] : ["icon.png"]);

const getNotificationIconPath = () =>
  isWindows ? findResourcePath(["icon.ico", "icon.png"]) : undefined;

const configPath = path.join(app.getPath("userData"), "window-state.json");

function loadWindowState() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    /* ignore */
  }
  return { x: undefined, y: undefined };
}

function saveWindowState() {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  try {
    fs.writeFileSync(configPath, JSON.stringify({ x: bounds.x, y: bounds.y }));
  } catch (e) {
    /* ignore */
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  function createTray() {
    tray = new Tray(getTrayImage());

    if (tray) {
      const contextMenu = Menu.buildFromTemplate([
        { label: "显示界面", click: () => mainWindow?.show() },
        { type: "separator" },
        { label: "退出程序", click: () => app.quit() },
      ]);
      tray.setToolTip(APP_NAME);
      tray.setContextMenu(contextMenu);
      tray.on("click", () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow?.show();
        }
      });
    }
  }

  function createWindow() {
    let state = loadWindowState();
    const appIconPath = getWindowIconPath();

    // 校验坐标是否在可见范围内 (V2.0.5 防止副屏丢失)
    if (state.x !== undefined && state.y !== undefined) {
      const displays = screen.getAllDisplays();
      const isVisible = displays.some((display) => {
        const { x, y, width, height } = display.bounds;
        return (
          state.x >= x &&
          state.x < x + width &&
          state.y >= y &&
          state.y < y + height
        );
      });

      if (!isVisible) {
        state.x = undefined;
        state.y = undefined;
      }
    }

    mainWindow = new BrowserWindow({
      width: 320,
      height: 480,
      x: state.x,
      y: state.y,
      minWidth: 320,
      minHeight: 480,
      maxWidth: 320,
      maxHeight: 480,
      icon: appIconPath || undefined,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: false,
      show: false,
      autoHideMenuBar: true,
      skipTaskbar: false,
      backgroundColor: "#00000000",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    mainWindow.once("ready-to-show", () => {
      mainWindow?.show();
    });

    mainWindow.on("move", saveWindowState);
    mainWindow.on("close", saveWindowState);
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.on("set-always-on-top", (event, flag) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(flag);
  });

  ipcMain.on("show-notification", (event, { title, body }) => {
    const iconPath = getNotificationIconPath();
    new Notification({
      title: title || APP_NAME,
      body,
      icon: iconPath ?? undefined,
      silent: true,
    }).show();
  });

  ipcMain.on("set-auto-start", (event, flag) => {
    // 只有在打包环境下才执行真实的快捷启动设置，避免 dev 环境干扰系统列表
    if (app.isPackaged) {
      if (isWindows) {
        // 解决 Portable 引导失效：优先使用原始 EXE 路径，否则指向临时目录会导致重启后找不到文件
        const exePath =
          process.env.PORTABLE_EXECUTABLE_FILE || app.getPath("exe");
        app.setLoginItemSettings({
          openAtLogin: flag,
          path: exePath,
        });
      } else {
        app.setLoginItemSettings({
          openAtLogin: flag,
        });
      }
    }
  });

  ipcMain.on("set-skip-taskbar", (event, flag) => {
    if (mainWindow) mainWindow.setSkipTaskbar(flag);
  });

  ipcMain.on("open-external", (event, url) => {
    import("electron").then(({ shell }) => shell.openExternal(url));
  });
}
