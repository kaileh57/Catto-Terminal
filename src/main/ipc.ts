import { ipcMain } from 'electron';

export function setupIpcHandlers() {
  // Create new terminal (mock for now)
  ipcMain.handle('terminal:create', async (event, id: string, shell?: string) => {
    console.log(`Creating terminal ${id} with shell: ${shell || 'default'}`);
    
    // Mock terminal data - simulate a simple prompt
    setTimeout(() => {
      const mockPrompt = process.platform === 'win32' ? 'C:\\> ' : '$ ';
      event.sender.send(`terminal:data:${id}`, mockPrompt);
    }, 100);
    
    return Promise.resolve();
  });
  
  // Write to terminal (mock)
  ipcMain.on('terminal:write', (event, id: string, data: string) => {
    console.log(`Terminal ${id} received input:`, data);
    
    // Echo back the input for now
    if (data === '\r') {
      event.sender.send(`terminal:data:${id}`, '\r\n');
      const mockPrompt = process.platform === 'win32' ? 'C:\\> ' : '$ ';
      event.sender.send(`terminal:data:${id}`, mockPrompt);
    } else {
      event.sender.send(`terminal:data:${id}`, data);
    }
  });
  
  // Resize terminal (mock)
  ipcMain.on('terminal:resize', (event, id: string, cols: number, rows: number) => {
    console.log(`Resizing terminal ${id} to ${cols}x${rows}`);
  });
  
  // Get app info
  ipcMain.handle('app:getVersion', () => {
    return process.env.npm_package_version || '0.1.0';
  });
}