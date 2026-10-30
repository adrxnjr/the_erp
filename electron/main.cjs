const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  mainWindow = new BrowserWindow({
    title: 'Ever Grow Schools ERP',
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    show: false, // Don't show until ready-to-show to prevent white flash
    backgroundColor: '#0D1026', // Matches School ERP theme
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
    },
  });

  // Smooth window display
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Security: prevent opening external links in the desktop app window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: restrict navigation within the window
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (isDev) {
      if (parsedUrl.host !== 'localhost:5173' && parsedUrl.host !== '127.0.0.1:5173') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } else {
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    }
  });

  // Load URL
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupAppMenu();
}

function setupAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print Active Document / Receipt',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'School ERP Documentation',
          click: () => shell.openExternal('https://github.com'),
        },
        {
          label: 'About Ever Grow Schools ERP',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Ever Grow Schools ERP',
              message: 'Ever Grow Schools — Enterprise Campus Management Platform',
              detail: `Version: ${app.getVersion()}\nDesktop Client: Windows x64 (Electron)\nBackend: FastAPI + PostgreSQL\n(c) 2026 Ever Grow Schools. All rights reserved.`,
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('app:get-version', () => app.getVersion());

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('app:print', () => {
  if (mainWindow) mainWindow.webContents.print();
});

ipcMain.on('app:open-external', (event, targetUrl) => {
  if (typeof targetUrl === 'string' && (targetUrl.startsWith('https://') || targetUrl.startsWith('http://'))) {
    shell.openExternal(targetUrl);
  }
});

// App Lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
