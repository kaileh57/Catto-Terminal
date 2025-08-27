import { ipcMain, WebContents } from 'electron';
import { ProcessManager, ProcessOptions } from './process-manager';
import { OpenRouterClient } from './openrouter-client';
import { SimpleKeyStorage } from './key-storage';

const processManager = new ProcessManager();
const terminalSenders = new Map<string, WebContents>();
let currentModel = 'anthropic/claude-3.5-haiku'; // Default model

export function setupIpcHandlers() {
  // Handle process output
  processManager.on('data', (id: string, data: string) => {
    const sender = terminalSenders.get(id);
    if (sender && !sender.isDestroyed()) {
      console.log(`Sending data to terminal ${id}:`, data);
      sender.send(`terminal:data:${id}`, data);
    } else {
      console.warn(`No sender for terminal ${id}`);
    }
  });

  // Handle process exit
  processManager.on('exit', (id: string, code: number | null, signal: string | null) => {
    const sender = terminalSenders.get(id);
    if (sender && !sender.isDestroyed()) {
      sender.send(`terminal:exit:${id}`, { code, signal });
    }
    terminalSenders.delete(id);
  });

  // Handle process errors
  processManager.on('error', (id: string, error: Error) => {
    const sender = terminalSenders.get(id);
    if (sender && !sender.isDestroyed()) {
      sender.send(`terminal:error:${id}`, error.message);
    }
  });

  // Create new terminal with real process
  ipcMain.handle('terminal:create', async (event, id: string, shell?: string) => {
    console.log(`Creating terminal ${id} with shell: ${shell || 'default'}`);
    
    try {
      // Store the sender for this terminal
      terminalSenders.set(id, event.sender);

      // Create process options with default terminal size
      const options: ProcessOptions = {
        cols: 80,
        rows: 30
      };
      if (shell) {
        options.shell = shell;
      }

      // Create the actual process
      const proc = processManager.createProcess(id, options);
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to create terminal ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });
  
  // Write to terminal
  ipcMain.on('terminal:write', (event, id: string, data: string) => {
    try {
      processManager.writeToProcess(id, data);
    } catch (error) {
      console.error(`Failed to write to terminal ${id}:`, error);
    }
  });
  
  // Resize terminal
  ipcMain.on('terminal:resize', (event, id: string, cols: number, rows: number) => {
    console.log(`Resizing terminal ${id} to ${cols}x${rows}`);
    processManager.resizeProcess(id, cols, rows);
  });

  // Kill terminal
  ipcMain.handle('terminal:kill', async (event, id: string) => {
    console.log(`Killing terminal ${id}`);
    processManager.killProcess(id);
    terminalSenders.delete(id);
    return { success: true };
  });

  // Get available shell profiles
  ipcMain.handle('terminal:getProfiles', async () => {
    try {
      const profiles = await ProcessManager.detectShellProfiles();
      return profiles;
    } catch (error) {
      console.error('Failed to detect shell profiles:', error);
      return [];
    }
  });
  
  // Get app info
  ipcMain.handle('app:getVersion', () => {
    return process.env.npm_package_version || '0.1.0';
  });

  // OpenRouter cat chat
  ipcMain.handle('cat:ask', async (event, prompt: string) => {
    try {
      // Try to get real API key, fallback to mock
      const apiKey = await SimpleKeyStorage.getAPIKey('openrouter');
      const client = apiKey ? new OpenRouterClient(apiKey) : OpenRouterClient.createMockClient();
      
      if (!apiKey) {
        console.log('No OpenRouter API key found, using mock responses');
      }
      
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a helpful, witty cat assistant in a terminal. Be concise but charming. Use some cat-like expressions occasionally but don\'t overdo it. You help with coding, questions, and terminal tasks.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      let fullResponse = '';
      
      await client.streamCompletion(messages, { model: currentModel }, (token) => {
        fullResponse += token;
        // Send each token to the renderer for streaming display
        event.sender.send('cat:token', token);
      });

      // Send completion signal
      event.sender.send('cat:complete', fullResponse);
      
      return { success: true };
    } catch (error) {
      console.error('Cat ask error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Set AI model
  ipcMain.handle('cat:setModel', async (event, model: string) => {
    try {
      console.log(`Setting AI model to: ${model}`);
      currentModel = model;
      return { success: true };
    } catch (error) {
      console.error('Set model error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // API Key management
  ipcMain.handle('keys:store', async (event, provider: string, key: string) => {
    try {
      await SimpleKeyStorage.storeAPIKey(provider, key);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('keys:get', async (event, provider: string) => {
    try {
      const key = await SimpleKeyStorage.getAPIKey(provider);
      return { success: true, key };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('keys:has', async (event, provider: string) => {
    try {
      const hasKey = await SimpleKeyStorage.hasAPIKey(provider);
      return { success: true, hasKey };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('keys:remove', async (event, provider: string) => {
    try {
      await SimpleKeyStorage.removeAPIKey(provider);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('keys:list', async (event) => {
    try {
      const providers = await SimpleKeyStorage.listProviders();
      return { success: true, providers };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}