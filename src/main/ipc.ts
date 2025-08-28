import { ipcMain, WebContents, shell } from 'electron';
import { ProcessManager, ProcessOptions } from './process-manager';
import { OpenRouterClient } from './openrouter-client';
import { SimpleKeyStorage } from './key-storage';

const processManager = new ProcessManager();
const terminalSenders = new Map<string, WebContents>();
let currentModel = 'anthropic/claude-3.5-haiku'; // Default model
let currentProviderPreferences: any = {}; // Provider routing preferences
let currentSystemPrompt = 'You are a helpful, witty cat assistant in a terminal. Be concise but charming. Use some cat-like expressions occasionally but don\'t overdo it. You help with coding, questions, and terminal tasks.'; // Current system prompt

// Load system prompt on startup
async function loadStoredSystemPrompt() {
  try {
    const storedPrompt = await SimpleKeyStorage.getAPIKey('system-prompt');
    if (storedPrompt) {
      currentSystemPrompt = storedPrompt;
      console.log('Loaded stored system prompt');
    }
  } catch (error) {
    console.log('No stored system prompt found, using default');
  }
}

export function setupIpcHandlers() {
  // Load stored system prompt
  loadStoredSystemPrompt();
  
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
          content: currentSystemPrompt
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      let fullResponse = '';
      
      await client.streamCompletion(messages, { 
        model: currentModel,
        ...currentProviderPreferences 
      }, (token) => {
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

  // Set system prompt with preset templates
  ipcMain.handle('cat:setSystemPrompt', async (event, preset: string, customPrompt?: string) => {
    try {
      console.log(`Setting system prompt preset: ${preset}`);
      
      const presetPrompts = {
        professional: 'You are a professional AI assistant in a terminal environment. Provide clear, accurate, and business-appropriate responses. Focus on efficiency and precision in your communication.',
        casual: 'You are a friendly AI assistant in a terminal. Keep things relaxed and conversational while being helpful. Use a warm, approachable tone in your responses.',
        developer: 'You are a technical AI assistant specialized in software development. Provide detailed code explanations, best practices, and technical guidance. Be precise with programming concepts and terminology.',
        playful: 'You are a fun and creative cat assistant in a terminal! 🐱 Be playful and use cat expressions like "purr-fect!" and "that\'s the cat\'s meow!" Keep responses engaging and delightful while still being helpful.',
        default: 'You are a helpful, witty cat assistant in a terminal. Be concise but charming. Use some cat-like expressions occasionally but don\'t overdo it. You help with coding, questions, and terminal tasks.'
      };

      if (preset === 'custom') {
        if (!customPrompt || customPrompt.trim().length === 0) {
          // If no custom prompt provided, fall back to default
          currentSystemPrompt = presetPrompts.default;
          console.log('No custom prompt provided, using default');
        } else {
          currentSystemPrompt = customPrompt.trim();
          console.log('Custom system prompt set');
        }
      } else if (presetPrompts[preset as keyof typeof presetPrompts]) {
        currentSystemPrompt = presetPrompts[preset as keyof typeof presetPrompts];
        console.log(`System prompt set to ${preset} preset`);
      } else {
        throw new Error(`Unknown preset: ${preset}`);
      }
      
      // Store the system prompt persistently
      await SimpleKeyStorage.storeAPIKey('system-prompt', currentSystemPrompt);
      await SimpleKeyStorage.storeAPIKey('system-prompt-preset', preset);
      
      console.log(`New system prompt: ${currentSystemPrompt.substring(0, 100)}...`);
      return { success: true };
    } catch (error) {
      console.error('Set system prompt error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Set AI model with provider preferences
  ipcMain.handle('cat:setModel', async (event, model: string, options?: {provider?: string; routing?: string}) => {
    try {
      console.log(`Setting AI model to: ${model}`);
      currentModel = model;
      
      // Reset provider preferences
      currentProviderPreferences = {};
      
      if (options) {
        console.log(`Model options:`, options);
        
        // Handle provider specification
        if (options.provider) {
          currentProviderPreferences.provider = {
            order: [options.provider],
            allow_fallbacks: true
          };
        }
        
        // Handle routing preferences (:nitro, :floor)
        if (options.routing) {
          if (options.routing === 'nitro') {
            currentProviderPreferences.provider = {
              ...currentProviderPreferences.provider,
              sort: 'throughput'
            };
          } else if (options.routing === 'floor') {
            currentProviderPreferences.provider = {
              ...currentProviderPreferences.provider,
              sort: 'price'
            };
          }
        }
      }
      
      console.log(`Provider preferences set:`, currentProviderPreferences);
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

  // Get current system prompt status
  ipcMain.handle('cat:getSystemPromptStatus', async (event) => {
    try {
      const storedPreset = await SimpleKeyStorage.getAPIKey('system-prompt-preset');
      return { 
        success: true, 
        currentPrompt: currentSystemPrompt.substring(0, 100) + (currentSystemPrompt.length > 100 ? '...' : ''),
        preset: storedPreset || 'default'
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Shell API handlers
  ipcMain.handle('shell:openExternal', async (event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Failed to open external URL:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}