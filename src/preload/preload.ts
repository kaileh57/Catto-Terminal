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
  setModel: (model: string, options?: {provider?: string; routing?: string}) => ipcRenderer.invoke('cat:setModel', model, options),
  setSystemPrompt: (preset: string, customPrompt?: string) => ipcRenderer.invoke('cat:setSystemPrompt', preset, customPrompt),
  getSystemPromptStatus: () => ipcRenderer.invoke('cat:getSystemPromptStatus'),
  onToken: (callback: (token: string) => void) => {
    const handler = (_: any, token: string) => callback(token);
    ipcRenderer.on('cat:token', handler);
    return () => ipcRenderer.removeListener('cat:token', handler);
  },
  onComplete: (callback: (response: string) => void) => {
    const handler = (_: any, response: string) => callback(response);
    ipcRenderer.on('cat:complete', handler);
    return () => ipcRenderer.removeListener('cat:complete', handler);
  },
};

const keysAPI = {
  store: (provider: string, key: string) => ipcRenderer.invoke('keys:store', provider, key),
  get: (provider: string) => ipcRenderer.invoke('keys:get', provider),
  has: (provider: string) => ipcRenderer.invoke('keys:has', provider),
  remove: (provider: string) => ipcRenderer.invoke('keys:remove', provider),
  list: () => ipcRenderer.invoke('keys:list'),
};

const shellAPI = {
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
};

// Expose APIs to renderer
contextBridge.exposeInMainWorld('terminal', terminalAPI);
contextBridge.exposeInMainWorld('app', appAPI);
contextBridge.exposeInMainWorld('cat', catAPI);
contextBridge.exposeInMainWorld('keys', keysAPI);
contextBridge.exposeInMainWorld('electronAPI', { shell: shellAPI });
