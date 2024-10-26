const path = require("path");
const express = require("express");
const { app, BrowserWindow, ipcMain } = require("electron");
const { isDev, PORT, LOCALHOST_URL } = require("./util/const");

const serverApp = express();

// Serve the Electron app's index.html over HTTP
serverApp.use(express.static(path.join(__dirname, "..", ".next/server/app")));

serverApp.listen(PORT, () => {
  console.log(`Electron Server running on ${LOCALHOST_URL}`);
});

console.log(isDev);

function createWindow() {
  let win = new BrowserWindow({
    width: isDev ? 1920 : 1366,
    height: isDev ? 1080 : 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    autoHideMenuBar: isDev ? false : true,
    frame: true,
  });

  win.loadURL(`${LOCALHOST_URL}`);

  win.on("closed", function () {
    win = null;
  });

  if (isDev) {
    // Open the DevTools.
    win.webContents.openDevTools();
  }

  return win;
}

app.whenReady().then(() => {
  const win = createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle fetching specific game details based on gameId
// ipcMain.handle("get-game-details", async (event, gameId) => {
//   getGameDetails(event, gameId);
// });
