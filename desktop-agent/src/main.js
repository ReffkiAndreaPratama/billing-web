const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, dialog, powerSaveBlocker } = require('electron');
const path = require('path');
const { SocketClient } = require('./socket/client');
const { SystemMonitor } = require('./monitor/system');
const { ScreenLocker } = require('./utils/locker');

let mainWindow = null;
let tray = null;
let socketClient = null;
let systemMonitor = null;
let screenLocker = null;
let powerGuard = null;

const CONFIG = {
  serverUrl: process.env.SERVER_URL || 'http://localhost:4000',
  machineId: process.env.MACHINE_ID || getMachineId(),
  branchId: process.env.BRANCH_ID || 'branch-1',
  reconnectInterval: 5000,
};

function getMachineId() {
  const crypto = require('crypto');
  const os = require('os');
  return crypto.createHash('md5').update(os.hostname() + os.platform() + os.arch()).digest('hex').substring(0, 12);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', 'assets', 'icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Agent', click: () => mainWindow?.show() },
    { label: 'Status: Connected', enabled: false, id: 'status' },
    { type: 'separator' },
    {
      label: 'Lock Screen',
      click: () => screenLocker?.lock(),
    },
    {
      label: 'Shutdown PC',
      click: () => {
        dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          message: 'Shutdown this PC?',
        }).then(({ response }) => {
          if (response === 0) require('child_process').exec('shutdown /s /t 10');
        });
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setToolTip('Billing Agent');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

async function initialize() {
  console.log(`🚀 Billing Agent v1.0.0`);
  console.log(`   Machine ID: ${CONFIG.machineId}`);
  console.log(`   Server: ${CONFIG.serverUrl}`);

  // Keep system awake
  powerGuard = powerSaveBlocker.start('prevent-display-sleep');

  // Screen locker
  screenLocker = new ScreenLocker();

  // System monitor
  systemMonitor = new SystemMonitor();
  systemMonitor.on('stats', (stats) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system:stats', stats);
    }
    // Send to server
    socketClient?.sendSystemStats(stats);
  });
  systemMonitor.start(5000);

  // Socket connection
  socketClient = new SocketClient(CONFIG.serverUrl, CONFIG.machineId, CONFIG.branchId);
  setupSocketEvents();

  // Create window & tray
  createWindow();
  createTray();

  // Send config to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('agent:config', CONFIG);
  });
}

function setupSocketEvents() {
  socketClient.on('connected', () => {
    updateTrayStatus('Connected');
    sendNotification('Agent Connected', 'Connected to billing server');
  });

  socketClient.on('disconnected', () => {
    updateTrayStatus('Disconnected');
  });

  socketClient.on('session:start', (data) => {
    mainWindow?.webContents.send('session:start', data);
    mainWindow?.show();
  });

  socketClient.on('session:end', () => {
    mainWindow?.webContents.send('session:end');
    sendNotification('Session Ended', 'Your gaming session has ended');

    // Lock screen after 10 seconds if not extended
    setTimeout(() => {
      screenLocker.lock();
    }, 10000);
  });

  socketClient.on('session:warning', (data) => {
    mainWindow?.webContents.send('session:warning', data);
    sendNotification('Time Warning', `${data.remainingMinutes} minutes remaining!`);
  });

  socketClient.on('command:lock', () => {
    screenLocker.lock();
  });

  socketClient.on('command:unlock', () => {
    screenLocker.unlock();
  });

  socketClient.on('command:shutdown', () => {
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['OK'],
      message: 'Server initiated shutdown. PC will shutdown in 30 seconds.',
    });
    setTimeout(() => require('child_process').exec('shutdown /s /t 0'), 30000);
  });

  socketClient.on('command:restart', () => {
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['OK'],
      message: 'Server initiated restart. PC will restart in 30 seconds.',
    });
    setTimeout(() => require('child_process').exec('shutdown /r /t 0'), 30000);
  });

  socketClient.on('command:message', (data) => {
    mainWindow?.webContents.send('popup:message', data);
    sendNotification('Message from Admin', data.message);
  });

  socketClient.on('command:screenshot', async () => {
    try {
      const screenshot = await captureScreen();
      socketClient.sendScreenshot(screenshot);
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  });

  socketClient.on('command:open', (data) => {
    try {
      require('child_process').exec(data.appPath);
    } catch (err) {
      console.error('Failed to open app:', err);
    }
  });

  socketClient.on('command:kiosk', () => { enableKioskMode(); });
  socketClient.on('command:exit-kiosk', () => { disableKioskMode(); });
  socketClient.on('command:launch-game', (data) => {
    const gamePaths = {
      'valorant': 'C:\\Riot Games\\VALORANT\\live\\VALORANT.exe',
      'dota2': 'C:\\Program Files\\Steam\\steamapps\\common\\dota 2 beta\\game\\bin\\win64\\dota2.exe',
      'csgo': 'C:\\Program Files\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\csgo.exe',
      'genshin': 'C:\\Program Files\\Genshin Impact\\launcher.exe',
      'pubg': 'C:\\Program Files\\Steam\\steamapps\\common\\PUBG\\TslGame\\Binaries\\Win64\\TslGame.exe',
      'mlbb': 'C:\\Program Files\\Mobile Legends\\MLBB.exe',
    };
    const exe = gamePaths[data.game] || data.appPath || data.game;
    require('child_process').exec(`"${exe}"`, (err) => {
      if (err) console.error('Game launch failed:', err);
    });
  });
}

function enableKioskMode() {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
    mainWindow.setSkipTaskbar(true);
    mainWindow.setResizable(false);
  }
  screenLocker?.lock();
}

function disableKioskMode() {
  if (mainWindow) {
    mainWindow.setFullScreen(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setSkipTaskbar(false);
    mainWindow.setResizable(true);
  }
  screenLocker?.unlock();
}

function updateTrayStatus(status) {
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Agent', click: () => mainWindow?.show() },
    { label: `Status: ${status}`, enabled: false },
    { type: 'separator' },
    {
      label: 'Lock Screen',
      click: () => screenLocker?.lock(),
    },
    {
      label: 'Shutdown PC',
      click: () => {
        dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          message: 'Shutdown this PC?',
        }).then(({ response }) => {
          if (response === 0) require('child_process').exec('shutdown /s /t 10');
        });
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray?.setContextMenu(contextMenu);
}

function sendNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, '..', 'assets', 'icon.ico') });
  }
}

async function captureScreen() {
  try {
    const { screen } = require('@electron/remote');
    // Basic approach: use desktopCapturer
    const sources = await require('electron').desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });
    if (sources.length > 0) {
      return sources[0].thumbnail.toDataURL();
    }
  } catch (err) {
    console.error('Capture error:', err);
  }
  return null;
}

// IPC Handlers
ipcMain.handle('lock-screen', () => screenLocker?.lock());
ipcMain.handle('unlock-screen', () => screenLocker?.unlock());
ipcMain.handle('get-system-info', async () => systemMonitor?.getCurrentStats());
ipcMain.handle('hide-window', () => mainWindow?.hide());
ipcMain.handle('show-window', () => mainWindow?.show());

app.whenReady().then(initialize);

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  systemMonitor?.stop();
  socketClient?.disconnect();
  if (powerGuard !== null) {
    powerSaveBlocker.stop(powerGuard);
  }
});
