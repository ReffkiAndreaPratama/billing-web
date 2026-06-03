const { exec } = require('child_process');
const { powerSaveBlocker } = require('electron');

class ScreenLocker {
  constructor() {
    this.isLocked = false;
    this.lockTimer = null;
  }

  lock() {
    if (this.isLocked) return;
    this.isLocked = true;

    console.log('🔒 Screen locked');

    // Windows lock screen
    try {
      exec('rundll32.exe user32.dll,LockWorkStation');
    } catch (err) {
      console.error('Lock failed:', err.message);
    }

    // Keep monitoring to re-lock if unlocked
    this.startLockMonitor();
  }

  unlock() {
    this.isLocked = false;
    if (this.lockTimer) {
      clearInterval(this.lockTimer);
      this.lockTimer = null;
    }
    console.log('🔓 Screen unlocked');
  }

  startLockMonitor() {
    // Check every 5 seconds if screen is locked
    this.lockTimer = setInterval(() => {
      if (this.isLocked) {
        // Re-apply lock in case user unlocked
        try {
          exec('rundll32.exe user32.dll,LockWorkStation');
        } catch {}
      }
    }, 5000);
  }

  // For kiosk mode: create a fullscreen always-on-top window
  createLockOverlay() {
    const { BrowserWindow } = require('electron');
    const lockWindow = new BrowserWindow({
      fullscreen: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      transparent: true,
      webPreferences: { nodeIntegration: false },
    });

    lockWindow.loadURL(`data:text/html,
      <html>
      <body style="margin:0;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;color:white;">
        <div style="text-align:center;">
          <h1 style="font-size:48px;">🔒</h1>
          <h2>PC Terkunci</h2>
          <p style="color:#888;">Silakan hubungi admin untuk membuka</p>
        </div>
      </body>
      </html>
    `);

    return lockWindow;
  }
}

module.exports = { ScreenLocker };
