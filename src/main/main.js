"use strict";

import { app, protocol, BrowserWindow } from "electron";
import path from "path";
import pkg from "./../../package.json";
import { initIpcEvent } from "./modules/ipc-event"
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { SCHEME, LOAD_URL } from "./config";

const isDevelopment = process.env.NODE_ENV !== "production";
if (process.env.NODE_ENV === "production") {
  global.__img = path.join(__dirname, "./img");
  global.__images = path.join(__dirname, "./images");
}
let mainWindow = null;

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
  mainWindow = new BrowserWindow({
    width: 1010,
    height: 694,
    backgroundColor: "#2d2d2d",
    frame: false,
    resizable: false,
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

  mainWindow.once("ready-to-show", async () => {
    mainWindow.show();
    // 设置任务栏操作和缩略图
    if (process.platform === "win32") {
      setThumbarButtons(mainWindow, false);
      mainWindow.setThumbnailClip({ x: 0, y: 0, width: 180, height: 50 });
    }
    // global.lyricWindow = createLyricWindow(BrowserWindow);
    // global.miniWindow = createMiniWindow(BrowserWindow);
  });

  if (isDevelopment && !process.env.IS_TEST) {
    // 安装 Vue Devtools
    try {
      mainWindow.webContents.session.loadExtension(
        path.resolve(__dirname, "./../../src/main/vue-devtools")
      );
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  global.mainWindow = mainWindow;

  initIpcEvent();
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// 处于开发者模式时干净地从父进程退出
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
