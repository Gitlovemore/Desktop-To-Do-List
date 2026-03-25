const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Drag: get real window position from main before drag starts
  getWinPos:      ()       => ipcRenderer.invoke('get-win-pos'),
  // Drag: send absolute target position each frame
  moveWin:        (x, y)  => ipcRenderer.send('win-move', { x, y }),
  // Mouse passthrough: false = UI active, true = transparent area passthrough
  setIgnoreMouse: (v)     => ipcRenderer.send('set-ignore-mouse', v),
  // Auto-launch
  getAutoLaunch:  ()      => ipcRenderer.invoke('get-autolaunch'),
  setAutoLaunch:  (v)     => ipcRenderer.send('set-autolaunch', v),
});
