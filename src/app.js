/**
 * @author Luuxis, FlyLonyx
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

const { app, ipcMain } = require("electron");
const { Microsoft } = require("tropolia_core");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const UpdateWindow = require("./assets/js/windows/updateWindow.js");
const MainWindow = require("./assets/js/windows/mainWindow.js");
const rpc = require("discord-rpc");

let dev = process.env.NODE_ENV === "dev";

if (dev) {
  let appPath = path.resolve("./AppData/Launcher").replace(/\\/g, "/");
  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath, { recursive: true });
  app.setPath("userData", appPath);
}

app.whenReady().then(() => {
  UpdateWindow.createWindow();
});

ipcMain.on("update-window-close", () => UpdateWindow.destroyWindow());
ipcMain.on("update-window-dev-tools", () =>
  UpdateWindow.getWindow().webContents.openDevTools({ mode: "detach" })
);
ipcMain.on("main-window-open", () => MainWindow.createWindow());
ipcMain.on("main-window-dev-tools", () =>
  MainWindow.getWindow().webContents.openDevTools({ mode: "detach" })
);
ipcMain.on("main-window-close", () => MainWindow.destroyWindow());
ipcMain.on("main-window-progress", (event, options) =>
  MainWindow.getWindow().setProgressBar(options.DL / options.totDL)
);
ipcMain.on("main-window-progress-reset", () =>
  MainWindow.getWindow().setProgressBar(0)
);
ipcMain.on("main-window-minimize", () => MainWindow.getWindow().minimize());

ipcMain.on("main-window-maximize", () => {
  if (MainWindow.getWindow().isMaximized()) {
    MainWindow.getWindow().unmaximize();
  } else {
    MainWindow.getWindow().maximize();
  }
});

ipcMain.on("main-window-hide", () => MainWindow.getWindow().hide());
ipcMain.on("main-window-show", () => MainWindow.getWindow().show());

ipcMain.handle("Microsoft-window", async (event, client_id) => {
  return await new Microsoft(client_id).getAuth();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

autoUpdater.autoDownload = false;

ipcMain.on("update-app", () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on("update-available", () => {
  const updateWindow = UpdateWindow.getWindow();
  updateWindow.webContents.send("updateAvailable");
});

ipcMain.on("start-update", () => {
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", () => {
  const updateWindow = UpdateWindow.getWindow();
  updateWindow.webContents.send("update-not-available");
});
autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on("download-progress", (progress) => {
  const updateWindow = UpdateWindow.getWindow();
  updateWindow.webContents.send("download-progress", progress);
});

let startedAppTime = Date.now();
let client = new rpc.Client({ transport: "ipc" });

ipcMain.on("discord", async () => {
  client.login({ clientId: "1244333045868269678" });
  client.on("ready", () => {
    client.request("SET_ACTIVITY", {
      pid: process.pid,
      activity: {
        details: "Dans le Launcher",
        assets: {
          large_image: "launcher",
        },
        instance: false,
        timestamps: {
          start: startedAppTime,
        },
      },
    });
  });
});

app.on("will-quit", () => {
  if (client) client.destroy();
});
