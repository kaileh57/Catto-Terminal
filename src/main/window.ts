import { BrowserWindow, shell } from 'electron';
import path from 'path';
import { DEFAULT_WINDOW_OPTIONS } from '../shared/constants';

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    ...DEFAULT_WINDOW_OPTIONS,
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2b2b2b',
      symbolColor: '#74b1be',
      height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // We need this for terminal functionality
      webSecurity: true,
    },
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  window.once('ready-to-show', () => {
    window.show();
    // Open DevTools automatically for debugging
    window.webContents.openDevTools();
  });

  // Enable keyboard shortcuts for DevTools
  window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      window.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Handle external links
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return window;
}