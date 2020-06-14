"use strict";

import { app, protocol, BrowserWindow } from "electron";
import path from "path";
import pkg from "./../../package.json";
import {
  createProtocol,
  /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
import { SCHEME, LOAD_URL } from './config';

const isDevelopment = process.env.NODE_ENV !== "production";

if (process.env.NODE_ENV === "production") {
  global.__img = path.join(__dirname, "./img");
  global.__images = path.join(__dirname, "./images");
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

const prevIcon =
  process.env.NODE_ENV === "development"
    ? "public/images/prev.png"
    : `${global.__images}/prev.png`;
const nextIcon =
  process.env.NODE_ENV === "development"
    ? "public/images/next.png"
    : `${global.__images}/next.png`;
const playIcon =
  process.env.NODE_ENV === "development"
    ? "public/images/play.png"
    : `${global.__images}/play.png`;
const pauseIcon =
  process.env.NODE_ENV === "development"
    ? "public/images/pause.png"
    : `${global.__images}/pause.png`;

const setThumbarButtons = function(mainWindow, playing) {
  mainWindow.setThumbarButtons([
    {
      tooltip: "上一曲",
      icon: prevIcon,
      click() {
        mainWindow.webContents.send("prev-play");
      },
    },
    {
      tooltip: playing ? "暂停" : "播放",
      icon: playing ? pauseIcon : playIcon,
      click() {
        mainWindow.webContents.send("toggle-play", {
          value: !playing,
        });
      },
    },
    {
      tooltip: "下一曲",
      icon: nextIcon,
      click() {
        mainWindow.webContents.send("next-play");
      },
    },
  ]);
};

function createWindow() {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      navigateOnDragDrop: true,
      devTools: true,
    },
  });

  // 设置appId才能使用Notification
  if (process.platform === "win32") {
    app.setAppUserModelId(pkg.appId);
  }

  // 去掉原生顶部菜单栏
  mainWindow.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 如果处于开发模式则从dev server加载url
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol(SCHEME);
    // 如果不处于开发者模式则加载index.html
    mainWindow.loadURL(LOAD_URL);
  }

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.webContents.send("will-close");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    // 设置任务栏操作和缩略图
    if (process.platform === "win32") {
      setThumbarButtons(mainWindow, false);
      mainWindow.setThumbnailClip({ x: 0, y: 0, width: 180, height: 50 });
    }
    // global.lyricWindow = createLyricWindow(BrowserWindow);
    // global.miniWindow = createMiniWindow(BrowserWindow);
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        // Devtools extensions are broken in Electron 6.0.0 and greater
        // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
        // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
        // If you are not using Windows 10 dark mode, you may uncomment these lines
        // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
        // try {
        //   await installVueDevtools()
        // } catch (e) {
        //   console.error('Vue Devtools failed to install:', e.toString())
        // }
      }
      createWindow();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}