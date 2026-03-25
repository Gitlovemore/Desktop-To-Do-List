const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');

let win = null;
let tray = null;
let autoLauncher = null;

// Single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { win.show(); win.focus(); }
  });
}

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 360,
    height: 600,
    x: width - 380,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // 'floating' level: stays above normal windows but does NOT block
  // clicks on other apps (unlike 'screen-saver' which hijacks all input)
  win.setAlwaysOnTop(true, 'floating');

  // Start with mouse passthrough ON — transparent areas let clicks fall through
  // Renderer will toggle this off/on as mouse enters/leaves UI elements
  win.setIgnoreMouseEvents(true, { forward: true });

  win.on('closed', () => { win = null; });
}

function createTray() {
  let icon;
  try {
    icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
  } catch (e) {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('FloatingTodo');

  function buildMenu(autoLaunchOn) {
    return Menu.buildFromTemplate([
      {
        label: 'Show / Hide',
        click: () => {
          if (!win) { createWindow(); return; }
          win.isVisible() ? win.hide() : win.show();
        }
      },
      { type: 'separator' },
      {
        label: 'Launch on system startup',
        type: 'checkbox',
        checked: autoLaunchOn,
        click: async (item) => {
          try {
            item.checked ? await autoLauncher.enable() : await autoLauncher.disable();
          } catch (e) { console.error(e); }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => { app.isQuiting = true; app.quit(); }
      },
    ]);
  }

  autoLauncher.isEnabled()
    .then(on => tray.setContextMenu(buildMenu(on)))
    .catch(() => tray.setContextMenu(buildMenu(false)));

  tray.on('click', () => {
    if (!win) { createWindow(); return; }
    win.isVisible() ? win.hide() : win.show();
  });
}

// ── IPC ──

// Renderer asks for current window position before each drag
ipcMain.handle('get-win-pos', () => {
  if (!win) return { x: 0, y: 0 };
  const [x, y] = win.getPosition();
  return { x, y };
});

// Renderer sends absolute target position every mousemove during drag
ipcMain.on('win-move', (_, { x, y }) => {
  if (win) win.setPosition(Math.round(x), Math.round(y));
});

// Renderer toggles mouse passthrough when cursor enters/leaves UI elements
// ignore=true  → transparent areas pass clicks through to windows below
// ignore=false → UI elements receive mouse events normally
ipcMain.on('set-ignore-mouse', (_, ignore) => {
  if (win) win.setIgnoreMouseEvents(ignore, { forward: true });
});

// Auto-launch toggle from renderer settings
ipcMain.handle('get-autolaunch', async () => {
  try { return await autoLauncher.isEnabled(); }
  catch { return false; }
});

ipcMain.on('set-autolaunch', async (_, enable) => {
  try {
    enable ? await autoLauncher.enable() : await autoLauncher.disable();
  } catch (e) { console.error(e); }
});

// ── Boot ──
app.whenReady().then(() => {
  // Initialize autoLauncher after app is ready
  autoLauncher = new AutoLaunch({
    name: 'FloatingTodo',
    path: app.getPath('exe'),
  });
  
  createWindow();
  createTray();
  app.on('activate', () => { if (!win) createWindow(); });
});

app.on('window-all-closed', e => { if (!app.isQuiting) e.preventDefault(); });
app.on('before-quit', () => { app.isQuiting = true; });
