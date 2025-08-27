import { contextBridge, ipcRenderer } from 'electron';

const terminalAPI = {
  create: (id: string, shell?: string) => 
    ipcRenderer.invoke('terminal:create', id, shell),
  
  write: (id: string, data: string) => 
    ipcRenderer.send('terminal:write', id, data),
  
  resize: (id: string, cols: number, rows: number) => 
    ipcRenderer.send('terminal:resize', id, cols, rows),
  
  onData: (id: string, callback: (data: string) => void) => {
    const handler = (_: any, data: string) => callback(data);
    ipcRenderer.on(`terminal:data:${id}`, handler);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(`terminal:data:${id}`, handler);
    };
  },
  
  onExit: (id: string, callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(`terminal:exit:${id}`, handler);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(`terminal:exit:${id}`, handler);
    };
  },
};

const appAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
};

const catAPI = {
  ask: (prompt: string) => ipcRenderer.invoke('cat:ask', prompt),
};

// Expose APIs to renderer
contextBridge.exposeInMainWorld('terminal', terminalAPI);
contextBridge.exposeInMainWorld('app', appAPI);
contextBridge.exposeInMainWorld('cat', catAPI);
