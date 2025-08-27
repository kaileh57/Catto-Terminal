// Cat Terminal - Main Application
// This is a single file that works directly in the browser

// Terminal configuration
const TERMINAL_OPTIONS = {
  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
  fontSize: 14,
  lineHeight: 1.2,
  cursorBlink: true,
  cursorStyle: 'block',
  scrollback: 1000,
  allowProposedApi: true, // Enable for better compatibility
  convertEol: true,
  disableStdin: false,
  allowTransparency: false,
  drawBoldTextInBrightColors: true,
  fastScrollModifier: 'alt',
  macOptionIsMeta: false,
  // Windows-specific options for backspace handling
  windowsMode: true,
  logLevel: 'off', // Disable parsing error logs
  // Text selection configuration
  rightClickSelectsWord: false,
  selectionMode: 'line', // Enable line-based selection (better than range)
  // Enable mouse selection  
  disableStdin: false,
  scrollSensitivity: 1,
  // Enable selection
  altClickMovesCursor: false,
  theme: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#d4d4d4',
    cursorAccent: '#1e1e1e',
    selection: 'rgba(255, 255, 255, 0.3)',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#ffffff'
  }
};

// Terminal Session class
class TerminalSession {
  constructor(container, id) {
    this.id = id;
    this.cleanupFunctions = [];
    this.lastSelection = ''; // Store last selection
    
    console.log('Creating terminal session:', id);
    
    // Initialize xterm with explicit dimensions and selection support
    this.terminal = new Terminal({
      ...TERMINAL_OPTIONS,
      theme: TERMINAL_OPTIONS.theme,
      cols: 80,
      rows: 24,
      // Windows-specific settings for proper backspace handling
      windowsMode: true,
      altClickMovesCursor: false,
      allowTransparency: false,
      // Ensure proper key handling for backspace
      macOptionIsMeta: false,
      // Set scrollback and enable proper character handling
      scrollback: 1000,
      allowProposedApi: true,
      // Force selection to be enabled
      selectionMode: 'line'
    });
    
    // Add fit addon
    this.fitAddon = new FitAddon.FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    
    // Open terminal in container
    this.terminal.open(container);
    
    // Enable text selection by ensuring focus doesn't prevent it
    this.terminal.element.addEventListener('mousedown', (e) => {
      console.log('Mouse down on terminal');
    });
    
    this.terminal.element.addEventListener('mouseup', (e) => {
      console.log('Mouse up on terminal');
      const selection = this.terminal.getSelection();
      console.log('Selection after mouse up:', selection);
    });
    
    // Add selection change listener  
    this.terminal.onSelectionChange(() => {
      const selection = this.terminal.getSelection();
      console.log('Selection changed:', selection);
      // Store the selection so we can use it even after it's cleared
      if (selection && selection.length > 0) {
        this.lastSelection = selection;
        console.log('Stored selection:', this.lastSelection);
      }
    });
    
    // Add right-click context menu for copying
    this.terminal.element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const selectedText = this.terminal.getSelection();
      const textToCopy = selectedText || this.lastSelection;
      console.log('Right-click - current selection:', selectedText);
      console.log('Right-click - last selection:', this.lastSelection);
      console.log('Right-click - text to copy:', textToCopy);
      
      if (textToCopy && textToCopy.length > 0) {
        // Create context menu
        const menu = document.createElement('div');
        menu.style.cssText = `
          position: absolute;
          left: ${e.pageX}px;
          top: ${e.pageY}px;
          background: #2d2d2d;
          border: 1px solid #555;
          border-radius: 4px;
          padding: 8px;
          color: white;
          font-family: sans-serif;
          font-size: 12px;
          z-index: 1000;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        menu.textContent = `Copy "${textToCopy.substring(0, 20)}${textToCopy.length > 20 ? '...' : ''}"`;
        
        menu.addEventListener('click', () => {
          navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('Right-click copy successful');
          }).catch(error => {
            console.error('Right-click copy failed:', error);
          });
          document.body.removeChild(menu);
          this.terminal.clearSelection();
        });
        
        // Remove menu on click elsewhere
        const removeMenu = () => {
          if (document.body.contains(menu)) {
            document.body.removeChild(menu);
          }
          document.removeEventListener('click', removeMenu);
        };
        
        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener('click', removeMenu), 100);
      } else {
        console.log('No text selected for right-click menu');
      }
    });
    
    // Wait a bit then fit the terminal properly
    setTimeout(() => {
      this.fitAddon.fit();
      const { cols, rows } = this.terminal;
      console.log('Terminal fitted to:', cols, 'x', rows);
    }, 100);
    
    // Setup PTY connection
    this.setupPtyConnection();
    
    // Handle resize
    this.setupResizeHandler();
    
    // Handle window controls
    this.setupWindowControls();
    
    // Create cat overlay
    this.catOverlay = null;
    if (window.CatOverlay) {
      this.catOverlay = new window.CatOverlay(document.body);
      this.catOverlay.setState('happy', 'Hello!');
      setTimeout(() => {
        this.catOverlay.setState('idle');
      }, 3000);
    }
    
    // Create command interceptor
    this.commandInterceptor = null;
    if (window.CommandInterceptor) {
      this.commandInterceptor = new window.CommandInterceptor();
    }
  }
  
  async setupPtyConnection() {
    try {
      // Test: Write something to terminal immediately to verify xterm.js works
      this.terminal.write('\x1b[33mInitializing Cat Terminal...\x1b[0m\r\n');
      this.terminal.write('Creating PowerShell process...\r\n');
      
      // Create PTY process
      const result = await window.terminal.create(this.id);
      console.log('Terminal create result:', result);
      
      // If creation failed, show error
      if (result && !result.success) {
        this.terminal.write(`\x1b[31mError: ${result.error || 'Failed to create terminal'}\x1b[0m\r\n`);
        return;
      }
      
      this.terminal.write('\x1b[32mConnected!\x1b[0m\r\n\r\n');
      
      // Handle data from PTY
      const dataCleanup = window.terminal.onData(this.id, (data) => {
        console.log(`Terminal ${this.id} received data:`, data);
        
        // Capture output for terminal context if we have a pending command
        this.captureCommandOutput(data);
        
        // Write all data directly to terminal - let xterm.js handle everything
        this.terminal.write(data);
        
        // Also handle clear screen ANSI sequences from PowerShell
        if (data.includes('\x1b[2J') || data.includes('\x1b[H') || data.includes('\x1b[3J')) {
          // Clear terminal when we receive clear screen sequences
          setTimeout(() => this.terminal.clear(), 10);
        }
        
        // Detect PowerShell errors and make cat angry
        if (this.catOverlay && (
          data.includes('is not recognized as the name of a cmdlet') ||
          data.includes('CommandNotFoundException') ||
          data.includes('ParameterBindingException') ||
          data.includes('cannot be found') ||
          data.includes('Access is denied') ||
          data.includes('The operation was canceled') ||
          data.includes('Exception') ||
          data.includes('Error:')
        )) {
          this.catOverlay.onError(data);
        }
      });
      if (dataCleanup) {
        this.cleanupFunctions.push(dataCleanup);
      }
      
      // Track current command being built locally - use class property
      
      // Send data to PTY with local command editing (use arrow function to preserve 'this' context)
      const inputDisposable = this.terminal.onData((data) => {
        // Log for debugging
        console.log(`Input data: "${data}", length: ${data.length}, char codes:`, 
          Array.from(data).map(c => c.charCodeAt(0)));
        
        // Handle prompt mode separately
        if (this.inPromptMode) {
          return this.handlePromptInput(data);
        }
        
        // Handle Ctrl+C for copying selected text
        if (data === '\x03') {
          const selectedText = this.terminal.getSelection();
          console.log('Ctrl+C detected - current selection:', selectedText);
          console.log('Ctrl+C detected - last stored selection:', this.lastSelection);
          
          // Use current selection or last stored selection
          const textToCopy = selectedText || this.lastSelection;
          
          if (textToCopy && textToCopy.length > 0) {
            console.log(`Copying text: "${textToCopy}"`);
            navigator.clipboard.writeText(textToCopy).then(() => {
              console.log('Text copied to clipboard successfully');
              // Flash the entire terminal briefly to show copy action
              this.flashTerminal();
            }).catch(error => {
              console.error('Failed to copy to clipboard:', error);
              this.terminal.write('\r\n\x1b[31m❌ Copy failed\x1b[0m\r\n');
            });
            // Clear both selection and stored selection
            this.terminal.clearSelection();
            this.lastSelection = '';
            return; // Don't send Ctrl+C to PowerShell
          } else {
            // No selection - send Ctrl+C to PowerShell as usual
            console.log('No selection available - sending Ctrl+C to PowerShell for process interrupt');
          }
        }

        // Handle arrow keys and escape sequences - don't send to PowerShell
        if (data.startsWith('\x1b[')) {
          console.log('Arrow key or escape sequence detected, not sending to PowerShell');
          this.handleArrowKey(data);
          return;
        }
        
        // Handle backspace and delete characters (DEL=127, BS=8)
        if (data === '\x7f' || data === '\x08') {
          console.log('Handling backspace locally');
          
          // If we were navigating history and user starts editing, exit history mode
          if (this.isNavigatingHistory) {
            this.isNavigatingHistory = false;
            this.currentHistoryIndex = -1;
            this.originalCommand = '';
          }
          
          if (this.currentCommand.length > 0) {
            // Remove last character from command buffer
            const beforeDelete = this.currentCommand;
            this.currentCommand = this.currentCommand.slice(0, -1);
            // Visual backspace: move cursor back, write space, move back again
            this.terminal.write('\x08 \x08');
          }
          return; // Don't send to PowerShell
        }
        
        // Handle truly empty strings
        if (data === '' || data.length === 0) {
          console.log('Received empty string - ignoring');
          return;
        }
        
        // Handle printable characters (32-126)
        if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
          console.log('Adding character to local command buffer');
          
          // If we were navigating history and user starts typing, exit history mode
          if (this.isNavigatingHistory) {
            this.isNavigatingHistory = false;
            this.currentHistoryIndex = -1;
            this.originalCommand = '';
          }
          
          // Initialize currentCommand if it's undefined
          if (this.currentCommand === undefined) {
            this.currentCommand = '';
          }
          
          this.currentCommand += data;
          this.terminal.write(data); // Show character locally
          return; // Don't send to PowerShell yet
        }
        
        // Handle Ctrl+V for paste in main terminal
        if (data === '\x16') {
          console.log('Ctrl+V detected in main terminal - attempting paste');
          try {
            navigator.clipboard.readText().then(clipboardText => {
              console.log(`Main terminal clipboard content: "${clipboardText}"`);
              if (clipboardText) {
                // Add clipboard content to command buffer and display it
                for (let i = 0; i < clipboardText.length; i++) {
                  const char = clipboardText[i];
                  // Only add printable characters, skip newlines
                  if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
                    const beforeAdd = this.currentCommand;
                    this.currentCommand += char;
                    this.terminal.write(char);
                  }
                }
                // Flash terminal to show paste action
                this.flashTerminal();
              }
            }).catch(error => {
              console.error('Main terminal clipboard access failed:', error);
            });
          } catch (error) {
            console.error('Main terminal clipboard error:', error);
          }
          return;
        }
        
        // Handle Ctrl+A for select all (debugging)
        if (data === '\x01') {
          console.log('Ctrl+A detected - selecting all terminal content');
          this.terminal.selectAll();
          return;
        }
        
        // Handle Enter key
        if (data === '\r') {
          console.log('Enter pressed, command:', JSON.stringify(this.currentCommand));
          
          // Add command to history before processing
          this.addToHistory(this.currentCommand);
          
          // Complete the visual line
          this.terminal.write('\r\n');
          
          const trimmedCommand = this.currentCommand.trim();
          
          // Try to intercept as a /command
          if (this.commandInterceptor && trimmedCommand && trimmedCommand.startsWith('/')) {
            const commandResult = this.commandInterceptor.interceptCommand(trimmedCommand);
            if (commandResult) {
              this.handleCommand(commandResult);
              this.currentCommand = ''; // Reset buffer
              return; // Don't send to shell
            }
          }
          
          // Handle clear command specially  
          if (trimmedCommand === 'clear' || trimmedCommand === 'cls') {
            this.terminal.clear(); // Clear the display
            this.currentCommand = ''; // Reset buffer  
            return; // Don't send to PowerShell - already handled
          }
          
          // Handle clear commands specially - clear terminal context too
          if (trimmedCommand === 'clear' || trimmedCommand === 'cls') {
            this.clearTerminalContext();
          }
          
          // Store command for context tracking (we'll get the output later)
          if (trimmedCommand) {
            this.pendingCommand = trimmedCommand;
            this.commandStartTime = Date.now();
          }
          
          // Send complete command to PowerShell
          if (trimmedCommand) {
            window.terminal.write(this.id, trimmedCommand + '\r');
          } else {
            window.terminal.write(this.id, '\r'); // Empty command
          }
          
          this.currentCommand = ''; // Reset buffer
          return;
        }
        
        // Handle control characters (Ctrl+C, etc.)
        if (data.charCodeAt(0) < 32) {
          console.log('Control character, sending to PowerShell');
          window.terminal.write(this.id, data);
          return;
        }
        
        // Make cat react to typing
        if (this.catOverlay && data) {
          this.catOverlay.onUserTyping();
        }
      });
      this.cleanupFunctions.push(() => inputDisposable.dispose());
      
      // Handle exit
      const exitCleanup = window.terminal.onExit(this.id, () => {
        this.terminal.write('\r\n[Process exited]');
      });
      if (exitCleanup) {
        this.cleanupFunctions.push(exitCleanup);
      }
      
    } catch (error) {
      console.error('Failed to setup PTY connection:', error);
      this.terminal.write('\r\nError: Failed to create terminal session\r\n');
    }
  }
  
  setupResizeHandler() {
    let resizeTimeout;
    
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize operations
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        try {
          const oldCols = this.terminal.cols;
          const oldRows = this.terminal.rows;
          
          this.fitAddon.fit();
          
          const { cols, rows } = this.terminal;
          
          // Only resize if dimensions actually changed
          if (cols !== oldCols || rows !== oldRows) {
            console.log(`Terminal resize: ${oldCols}x${oldRows} -> ${cols}x${rows}`);
            window.terminal.resize(this.id, cols, rows);
          }
        } catch (error) {
          console.error('Resize error:', error);
        }
      }, 250); // 250ms debounce
    });
    
    if (this.terminal.element) {
      resizeObserver.observe(this.terminal.element);
      this.cleanupFunctions.push(() => {
        resizeObserver.disconnect();
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
      });
    }
    
    // Also handle window resize
    const windowResizeHandler = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        this.fitAddon.fit();
        const { cols, rows } = this.terminal;
        window.terminal.resize(this.id, cols, rows);
      }, 250);
    };
    
    window.addEventListener('resize', windowResizeHandler);
    this.cleanupFunctions.push(() => {
      window.removeEventListener('resize', windowResizeHandler);
    });
  }
  
  /**
   * Handle intercepted commands
   * @param {CommandResult} commandResult 
   */
  handleCommand(commandResult) {
    console.log('Handling command:', commandResult);
    
    switch (commandResult.type) {
      case 'cat-ask':
        this.handleCatAsk(commandResult.prompt);
        break;
      
      case 'toggle':
        this.handleToggle(commandResult.target, commandResult.value);
        break;
        
      case 'help':
        this.handleHelp(commandResult.command);
        break;
        
      case 'spawn-agent':
        this.handleSpawnAgent(commandResult);
        break;
        
      case 'ask-agent':
        this.handleAskAgent(commandResult.agent, commandResult.prompt);
        break;

      case 'setup-key':
        this.handleSetupKey(commandResult.provider);
        break;

      case 'setup-status':
        this.handleSetupStatus();
        break;

      case 'setup-help':
        this.terminal.write(`\r\n\x1b[36m${commandResult.message}\x1b[0m\r\n`);
        break;

      case 'prompt-help':
        this.terminal.write(`\r\n\x1b[36m${commandResult.message}\x1b[0m\r\n`);
        break;

      case 'prompt-set':
        this.handlePromptSet(commandResult.preset);
        break;

      case 'prompt-preview':
        this.handlePromptPreview(commandResult.preset);
        break;

      case 'model-list':
        this.terminal.write(`\r\n\x1b[36m${commandResult.message}\x1b[0m\r\n`);
        break;

      case 'model-set':
        this.handleModelSet(commandResult.model, commandResult.provider, commandResult.routing);
        break;
        
      case 'error':
        this.terminal.write(`\r\n\x1b[31m${commandResult.message}\x1b[0m\r\n`);
        break;
        
      default:
        this.terminal.write(`\r\n\x1b[33mCommand not implemented yet: ${commandResult.type}\x1b[0m\r\n`);
    }
  }

  /**
   * Handle /cat command - now with real AI streaming and terminal context!
   */
  async handleCatAsk(prompt) {
    this.terminal.write(`\r\n\x1b[36m🐱 Asking cat: ${prompt}\x1b[0m\r\n`);
    
    if (this.catOverlay) {
      this.catOverlay.setState('thinking', 'Meow... thinking...');
    }

    try {
      let catResponse = '';
      
      // Generate terminal context to enhance the AI's understanding
      const terminalContext = this.generateAIContext();
      
      // Enhance the prompt with terminal context
      let enhancedPrompt = prompt;
      if (terminalContext) {
        enhancedPrompt = `${terminalContext}\n\nUser Question: ${prompt}\n\nPlease provide a helpful response considering the terminal context above.`;
        console.log('Enhanced prompt with context:', enhancedPrompt.substring(0, 200) + '...');
      }
      
      // Set up streaming token handler
      const tokenCleanup = window.cat.onToken((token) => {
        catResponse += token;
        this.terminal.write(token);
        
        // Show the response building up in real-time in cat speech bubble
        if (this.catOverlay) {
          this.catOverlay.setState('love', catResponse.substring(0, 50) + (catResponse.length > 50 ? '...' : ''));
        }
      });
      
      // Set up completion handler
      const completeCleanup = window.cat.onComplete((fullResponse) => {
        this.terminal.write(`\r\n`);
        
        // Clean up event listeners
        tokenCleanup();
        completeCleanup();
        
        if (this.catOverlay) {
          this.catOverlay.setState('happy', 'Purr! Hope that helps!');
          setTimeout(() => this.catOverlay.setState('idle'), 5000);
        }
      });
      
      // Ask the cat using the exposed API with enhanced context
      const result = await window.cat.ask(enhancedPrompt);
      
      if (!result.success) {
        // Clean up listeners on error
        tokenCleanup();
        completeCleanup();
        throw new Error(result.error || 'Failed to ask cat');
      }
      
    } catch (error) {
      console.error('Cat ask error:', error);
      this.terminal.write(`\x1b[31mCat error: ${error.message}\x1b[0m\r\n`);
      
      if (this.catOverlay) {
        this.catOverlay.setState('angry', 'Grr! Something went wrong!');
        setTimeout(() => this.catOverlay.setState('idle'), 3000);
      }
    }
  }

  /**
   * Handle /toggle command
   */
  handleToggle(target, value) {
    if (target === 'cat') {
      if (this.catOverlay) {
        switch (value) {
          case 'off':
            this.catOverlay.hide();
            this.terminal.write(`\r\n\x1b[32mCat overlay hidden\x1b[0m\r\n`);
            break;
          case 'on':
            this.catOverlay.show();
            this.catOverlay.setTextOnlyMode(false); // Ensure visual mode is enabled
            this.terminal.write(`\r\n\x1b[32mCat overlay shown in visual mode\x1b[0m\r\n`);
            break;
          case 'text':
            this.catOverlay.setTextOnlyMode(true);
            this.terminal.write(`\r\n\x1b[32mCat switched to text-only mode\x1b[0m\r\n`);
            break;
        }
      } else {
        this.terminal.write(`\r\n\x1b[33mCat overlay not available\x1b[0m\r\n`);
      }
    }
  }

  /**
   * Handle /help command
   */
  handleHelp(command) {
    if (this.commandInterceptor) {
      const helpText = this.commandInterceptor.getHelpText(command);
      this.terminal.write(`\r\n\x1b[36mCat Terminal Commands:\x1b[0m\r\n${helpText}\r\n`);
    } else {
      this.terminal.write(`\r\n\x1b[33mCommand interceptor not available\x1b[0m\r\n`);
    }
  }

  /**
   * Handle /spawn command (placeholder for future agent system)
   */
  handleSpawnAgent(commandResult) {
    this.terminal.write(`\x1b[33mAgent system not implemented yet.\x1b[0m\r\n`);
    this.terminal.write(`\x1b[33mWould create agent: ${commandResult.name} (${commandResult.model})\x1b[0m\r\n`);
  }

  /**
   * Handle /ask command (placeholder for future agent system)
   */
  handleAskAgent(agent, prompt) {
    this.terminal.write(`\x1b[33mAgent system not implemented yet.\x1b[0m\r\n`);
    this.terminal.write(`\x1b[33mWould ask @${agent}: ${prompt}\x1b[0m\r\n`);
  }

  /**
   * Handle /setup key command
   */
  async handleSetupKey(provider) {
    this.terminal.write(`\r\n\x1b[36mSetting up ${provider} API key...\x1b[0m\r\n`);
    this.terminal.write(`\x1b[33mPlease enter your ${provider} API key: \x1b[0m`);
    
    // Create input prompt
    this.promptForInput('Enter API key (secure input - paste with Ctrl+V and press Enter): ', async (key) => {
      if (!key || key.trim().length === 0) {
        this.terminal.write(`\r\n\x1b[31mNo key entered. Setup cancelled.\x1b[0m\r\n`);
        return;
      }

      try {
        const result = await window.keys.store(provider, key.trim());
        if (result.success) {
          this.terminal.write(`\r\n\x1b[32m✅ ${provider} API key saved successfully!\x1b[0m\r\n`);
          this.terminal.write(`\x1b[32mYou can now use /cat commands with real AI responses.\x1b[0m\r\n`);
          
          if (this.catOverlay) {
            this.catOverlay.setState('happy', 'Ready for real AI!');
            setTimeout(() => this.catOverlay.setState('idle'), 3000);
          }
        } else {
          this.terminal.write(`\r\n\x1b[31m❌ Failed to save API key: ${result.error}\x1b[0m\r\n`);
        }
      } catch (error) {
        this.terminal.write(`\r\n\x1b[31m❌ Error saving API key: ${error.message}\x1b[0m\r\n`);
      }
    });
  }

  /**
   * Handle /setup status command
   */
  async handleSetupStatus() {
    this.terminal.write(`\r\n\x1b[36mChecking API key status...\x1b[0m\r\n`);
    
    try {
      const result = await window.keys.list();
      if (result.success) {
        if (result.providers && result.providers.length > 0) {
          this.terminal.write(`\x1b[32m✅ Configured providers:\x1b[0m\r\n`);
          result.providers.forEach(provider => {
            this.terminal.write(`  • ${provider}\r\n`);
          });
        } else {
          this.terminal.write(`\x1b[33m⚠️  No API keys configured.\x1b[0m\r\n`);
          this.terminal.write(`\x1b[33mUse /setup key openrouter to add your OpenRouter API key.\x1b[0m\r\n`);
        }
      } else {
        this.terminal.write(`\x1b[31m❌ Error checking status: ${result.error}\x1b[0m\r\n`);
      }
    } catch (error) {
      this.terminal.write(`\x1b[31m❌ Error: ${error.message}\x1b[0m\r\n`);
    }
  }

  /**
   * Handle /model set command with provider and routing support
   */
  async handleModelSet(model, provider, routing) {
    let displayText = `Switching to model: ${model}`;
    if (provider) displayText += ` (provider: ${provider})`;
    if (routing) displayText += ` (routing: ${routing})`;
    
    this.terminal.write(`\r\n\x1b[36m${displayText}\x1b[0m\r\n`);
    
    try {
      const result = await window.cat.setModel(model, {
        provider: provider,
        routing: routing
      });
      
      if (result.success) {
        this.terminal.write(`\x1b[32m✅ Model switched successfully!\x1b[0m\r\n`);
        
        if (this.catOverlay) {
          const modelName = model.includes('haiku') ? 'Haiku' : 
                           model.includes('sonnet') ? 'Sonnet' :
                           model.includes('gpt-4') ? 'GPT-4' :
                           model.includes('llama') ? 'Llama' :
                           model.includes('deepseek') ? 'DeepSeek' : 'New Model';
          this.catOverlay.setState('happy', `Now using ${modelName}!`);
          setTimeout(() => this.catOverlay.setState('idle'), 3000);
        }
      } else {
        throw new Error(result.error || 'Failed to switch model');
      }
    } catch (error) {
      console.error('Model switch error:', error);
      this.terminal.write(`\x1b[31m❌ Error switching model: ${error.message}\x1b[0m\r\n`);
      
      if (this.catOverlay) {
        this.catOverlay.setState('angry', 'Model switch failed!');
        setTimeout(() => this.catOverlay.setState('idle'), 3000);
      }
    }
  }

  /**
   * Handle /setup prompt command
   */
  async handlePromptSet(preset) {
    this.terminal.write(`\r\n\x1b[36mConfiguring system prompt: ${preset}\x1b[0m\r\n`);
    
    if (preset === 'custom') {
      this.promptForInput('Enter your custom system prompt (or press Enter for default): ', async (customPrompt) => {
        if (!customPrompt || customPrompt.trim().length === 0) {
          preset = 'default';
        }
        
        const result = await window.cat.setSystemPrompt(preset, customPrompt?.trim());
        this.handlePromptSetResult(result, preset, customPrompt);
      });
      return;
    }
    
    try {
      const result = await window.cat.setSystemPrompt(preset);
      this.handlePromptSetResult(result, preset);
    } catch (error) {
      console.error('Prompt set error:', error);
      this.terminal.write(`\x1b[31m❌ Error setting prompt: ${error.message}\x1b[0m\r\n`);
      
      if (this.catOverlay) {
        this.catOverlay.setState('angry', 'Prompt setup failed!');
        setTimeout(() => this.catOverlay.setState('idle'), 3000);
      }
    }
  }

  /**
   * Handle the result of setting a system prompt
   */
  handlePromptSetResult(result, preset, customPrompt) {
    if (result.success) {
      this.terminal.write(`\x1b[32m✅ System prompt set to "${preset}"!\x1b[0m\r\n`);
      
      if (preset === 'custom' && customPrompt) {
        this.terminal.write(`\x1b[37mCustom prompt: "${customPrompt.substring(0, 50)}${customPrompt.length > 50 ? '...' : ''}"\x1b[0m\r\n`);
      }
      
      if (this.catOverlay) {
        let message = '';
        switch (preset) {
          case 'professional': message = 'Ready for business!'; break;
          case 'casual': message = 'Hey there, friend!'; break;
          case 'developer': message = 'Code mode activated!'; break;
          case 'playful': message = 'Let\'s have some fun!'; break;
          case 'custom': message = 'Custom personality ready!'; break;
          case 'default': message = 'Back to my true self!'; break;
          default: message = 'Personality updated!';
        }
        
        this.catOverlay.setState('happy', message);
        setTimeout(() => this.catOverlay.setState('idle'), 3000);
      }
    } else {
      this.terminal.write(`\x1b[31m❌ Failed to set system prompt: ${result.error}\x1b[0m\r\n`);
      
      if (this.catOverlay) {
        this.catOverlay.setState('angry', 'Prompt setup failed!');
        setTimeout(() => this.catOverlay.setState('idle'), 3000);
      }
    }
  }

  /**
   * Handle prompt preview command
   */
  handlePromptPreview(preset) {
    this.terminal.write(`\r\n\x1b[36m📋 Preview for "${preset}" preset:\x1b[0m\r\n`);
    
    const presetDescriptions = {
      professional: {
        description: 'A formal, business-oriented assistant that focuses on efficiency and precision.',
        behavior: 'Will provide clear, accurate responses with professional tone. Avoids casual language.',
        example: '"I can assist you with your terminal tasks. Please specify your requirements for optimal results."'
      },
      casual: {
        description: 'A friendly, relaxed assistant that uses warm, approachable communication.',
        behavior: 'Uses conversational tone, may include friendly expressions and casual language.',
        example: '"Hey! What can I help you with today? I\'m here to make your terminal experience smooth."'
      },
      developer: {
        description: 'A technical assistant specialized in software development and coding.',
        behavior: 'Provides detailed technical explanations, best practices, and precise programming guidance.',
        example: '"I can help analyze your code, suggest optimizations, and explain technical concepts in detail."'
      },
      playful: {
        description: 'A fun, creative cat assistant with personality and cat-themed expressions.',
        behavior: 'Uses cat puns, emojis, and playful language while remaining helpful.',
        example: '"That\'s purr-fect! 🐱 Let me help you with that - it\'ll be the cat\'s meow when we\'re done!"'
      },
      default: {
        description: 'The original cat assistant - witty but balanced, with occasional cat expressions.',
        behavior: 'Combines helpfulness with charm, uses some cat expressions but doesn\'t overdo it.',
        example: '"I\'m here to help with your terminal tasks. Let\'s make this purr-fectly smooth!"'
      }
    };
    
    const preset_info = presetDescriptions[preset];
    if (preset_info) {
      this.terminal.write(`\x1b[37m📝 Description: ${preset_info.description}\x1b[0m\r\n`);
      this.terminal.write(`\x1b[37m⚡ Behavior: ${preset_info.behavior}\x1b[0m\r\n`);
      this.terminal.write(`\x1b[37m💬 Example: ${preset_info.example}\x1b[0m\r\n`);
      this.terminal.write(`\r\n\x1b[33m💡 To apply this preset, use: /setup prompt ${preset}\x1b[0m\r\n`);
      
      if (this.catOverlay) {
        this.catOverlay.setState('thinking', `Previewing ${preset}...`);
        setTimeout(() => this.catOverlay.setState('idle'), 2000);
      }
    } else {
      this.terminal.write(`\x1b[31m❌ Unknown preset: ${preset}\x1b[0m\r\n`);
    }
  }

  /**
   * Prompt user for input
   */
  promptForInput(prompt, callback) {
    this.terminal.write(`\r\n${prompt}`);
    
    // Set flag to indicate we're in prompt mode
    this.inPromptMode = true;
    this.promptBuffer = '';
    this.promptCallback = (input) => {
      this.inPromptMode = false;
      this.promptCallback = null;
      this.promptBuffer = '';
      callback(input);
    };
  }

  /**
   * Handle input while in prompt mode
   */
  async handlePromptInput(data) {
    console.log(`Prompt mode input: "${data}", length: ${data.length}, char codes:`, 
      Array.from(data).map(c => c.charCodeAt(0)));
    console.log(`Current prompt buffer: "${this.promptBuffer}"`);
    
    if (data === '\r') {
      // Enter pressed - finish input
      const input = this.promptBuffer;
      console.log(`Prompt finished with input: "${input}"`);
      if (this.promptCallback) {
        this.promptCallback(input);
      }
      return;
    } else if (data === '\x7f' || data === '\x08') {
      // Backspace
      if (this.promptBuffer.length > 0) {
        this.promptBuffer = this.promptBuffer.slice(0, -1);
        this.terminal.write('\x08 \x08');
        console.log(`After backspace, prompt buffer: "${this.promptBuffer}"`);
      }
      return;
    } else if (data === '\x16') {
      // Ctrl+V - Handle paste
      console.log('Ctrl+V detected - attempting paste from clipboard');
      try {
        const clipboardText = await navigator.clipboard.readText();
        console.log(`Clipboard content: "${clipboardText}"`);
        if (clipboardText) {
          // Add clipboard content to buffer and display asterisks
          for (let i = 0; i < clipboardText.length; i++) {
            const char = clipboardText[i];
            // Only add printable characters, skip newlines
            if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
              this.promptBuffer += char;
              this.terminal.write('*'); // Show asterisk instead of actual character
            }
          }
          console.log(`After paste, prompt buffer: "${this.promptBuffer}"`);
        }
      } catch (error) {
        console.error('Failed to read from clipboard:', error);
        this.terminal.write('\r\n\x1b[31mClipboard access failed. Please type the key manually.\x1b[0m\r\n');
      }
      return;
    } else if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
      // Printable character
      this.promptBuffer += data;
      // Show asterisk for security instead of actual character
      this.terminal.write('*'); 
      console.log(`Added char to prompt buffer: "${data}", buffer now: "${this.promptBuffer}"`);
      return;
    } else if (data.length > 1) {
      // Handle pasted content (multi-character input)
      console.log('Multi-character input detected (possible paste):', data);
      for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
          this.promptBuffer += char;
          this.terminal.write('*'); // Show asterisk instead of actual character
        }
      }
      console.log(`After paste, prompt buffer: "${this.promptBuffer}"`);
      return;
    }
    
    console.log('Ignoring input:', data, 'char codes:', Array.from(data).map(c => c.charCodeAt(0)));
  }

  /**
   * Handle arrow key input for command history navigation
   */
  handleArrowKey(data) {
    // Determine if we're dealing with up or down arrow
    if (data === '\x1b[A') { // Up arrow
      this.navigateHistoryUp();
    } else if (data === '\x1b[B') { // Down arrow  
      this.navigateHistoryDown();
    }
    // Ignore other escape sequences (left/right arrows, etc.)
  }

  /**
   * Navigate up in command history (older commands)
   */
  navigateHistoryUp() {
    // Determine which history to use based on current command
    const isSlashCommand = this.currentCommand.startsWith('/');
    const history = isSlashCommand ? this.commandHistory : this.shellHistory;
    
    if (history.length === 0) return; // No history available
    
    // If we're starting history navigation, save the current command
    if (!this.isNavigatingHistory) {
      this.originalCommand = this.currentCommand;
      this.currentHistoryIndex = history.length; // Start after the last item
      this.isNavigatingHistory = true;
    }
    
    // Move up in history (older commands)
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      const historyCommand = history[this.currentHistoryIndex];
      this.replaceCurrentCommand(historyCommand);
    }
  }

  /**
   * Navigate down in command history (newer commands)  
   */
  navigateHistoryDown() {
    if (!this.isNavigatingHistory) return; // Not in history mode
    
    const isSlashCommand = this.currentCommand.startsWith('/');
    const history = isSlashCommand ? this.commandHistory : this.shellHistory;
    
    // Move down in history (newer commands)
    if (this.currentHistoryIndex < history.length - 1) {
      this.currentHistoryIndex++;
      const historyCommand = history[this.currentHistoryIndex];
      this.replaceCurrentCommand(historyCommand);
    } else if (this.currentHistoryIndex === history.length - 1) {
      // At the newest command, go back to original  
      this.currentHistoryIndex++;
      this.replaceCurrentCommand(this.originalCommand);
    }
  }

  /**
   * Replace the current command line with a new command
   */
  replaceCurrentCommand(newCommand) {
    // Clear current command visually
    this.clearCurrentCommand();
    
    // Set new command and display it
    this.currentCommand = newCommand;
    if (newCommand) {
      this.terminal.write(newCommand);
    }
  }

  /**
   * Clear the current command line visually
   */
  clearCurrentCommand() {
    // Move cursor back to beginning of command and clear to end of line
    if (this.currentCommand.length > 0) {
      // Move cursor back by the length of current command
      this.terminal.write('\x1b[' + this.currentCommand.length + 'D'); // Move cursor left
      this.terminal.write('\x1b[K'); // Clear from cursor to end of line
    }
  }

  /**
   * Flash the terminal briefly to provide visual feedback
   */
  flashTerminal() {
    // Flash just the terminal screen content, not the whole frame
    const screenElement = this.terminal.element?.querySelector('.xterm-screen');
    if (screenElement) {
      // Quick subtle flash of the text content only
      screenElement.style.transition = 'opacity 0.05s ease';
      screenElement.style.opacity = '0.7';
      
      // Return to normal after 80ms for quick subtle feedback
      setTimeout(() => {
        screenElement.style.opacity = '1';
        setTimeout(() => {
          screenElement.style.transition = '';
        }, 50);
      }, 80);
    }
  }

  /**
   * Capture command output for terminal context
   */
  captureCommandOutput(data) {
    if (!this.pendingCommand) return;
    
    // Accumulate output
    this.commandOutput += data;
    
    // Check if this looks like a PowerShell prompt (indicating command completion)
    // Look for patterns like "PS C:\Users\kelle> " 
    if ((data.includes('PS ') && data.includes('> ')) || 
        data.match(/PS\s+[^>]+>\s*$/)) {
      // Command completed - process the accumulated output
      this.processCompletedCommand();
    }
    
    // Also check for command timeout (in case prompt detection fails)
    if (this.commandStartTime && (Date.now() - this.commandStartTime) > 5000) {
      // Command took longer than 5 seconds - probably completed
      console.log('Command timeout, processing completed command');
      this.processCompletedCommand();
    }
  }
  
  /**
   * Process a completed command and add to terminal context
   */
  processCompletedCommand() {
    if (!this.pendingCommand) return;
    
    // Extract just the output (remove the command echo and final prompt)
    let output = this.commandOutput;
    
    // Remove the command echo at the beginning
    const commandEcho = this.pendingCommand;
    if (output.startsWith(commandEcho)) {
      output = output.substring(commandEcho.length);
    }
    
    // Remove the final PowerShell prompt
    const promptRegex = /PS [^>]+>\s*$/m;
    output = output.replace(promptRegex, '').trim();
    
    // Detect if this was an error
    const isError = output.includes('CommandNotFoundException') ||
                   output.includes('CategoryInfo') ||
                   output.includes('FullyQualifiedErrorId') ||
                   output.toLowerCase().includes('error') ||
                   output.toLowerCase().includes('exception');
    
    // Add to terminal context
    this.addToTerminalContext(this.pendingCommand, output, isError);
    
    // Reset pending command state
    this.pendingCommand = null;
    this.commandOutput = '';
    this.commandStartTime = null;
  }

  /**
   * Add command to terminal context for AI integration
   */
  addToTerminalContext(command, output = '', isError = false) {
    // Safety check - initialize if needed
    if (!this.terminalContext) {
      console.log('WARNING: terminalContext not initialized in addToTerminalContext, creating default');
      this.terminalContext = {
        recentCommands: [],
        currentDirectory: 'C:\\Users\\kelle',
        lastError: null,
        maxCommands: 10
      };
    }
    
    const contextEntry = {
      command: command.trim(),
      output: this.filterSensitiveOutput(output),
      isError: isError,
      timestamp: new Date(),
      directory: this.terminalContext.currentDirectory
    };
    
    // Add to recent commands
    this.terminalContext.recentCommands.push(contextEntry);
    
    // Keep only the last N commands to avoid token limits
    if (this.terminalContext.recentCommands.length > this.terminalContext.maxCommands) {
      this.terminalContext.recentCommands.shift();
    }
    
    // Update current directory if it's a directory change command
    this.updateCurrentDirectory(command, output);
    
    // Track last error for quick reference
    if (isError) {
      this.terminalContext.lastError = contextEntry;
    }
    
    console.log('Added to terminal context:', contextEntry.command);
  }
  
  /**
   * Filter sensitive information from command output
   */
  filterSensitiveOutput(output) {
    if (!output) return '';
    
    // Truncate very long output to avoid token limits
    const maxOutputLength = 500;
    let filtered = output.length > maxOutputLength 
      ? output.substring(0, maxOutputLength) + '\n[... output truncated ...]'
      : output;
    
    // Remove potential sensitive patterns
    filtered = filtered
      // Remove potential API keys (long alphanumeric strings)
      .replace(/[A-Za-z0-9]{32,}/g, '[REDACTED_KEY]')
      // Remove potential passwords in URLs
      .replace(/:\/\/[^:]+:[^@]+@/g, '://[REDACTED]@')
      // Remove Windows-style paths that might contain sensitive info
      .replace(/C:\\Users\\[^\\]+\\AppData\\[^\s]*/g, '[USER_APPDATA]');
    
    return filtered.trim();
  }
  
  /**
   * Update current directory based on command execution
   */
  updateCurrentDirectory(command, output) {
    const cmd = command.trim().toLowerCase();
    
    // Handle cd commands
    if (cmd.startsWith('cd ') || cmd === 'cd') {
      if (cmd === 'cd' || cmd === 'cd ~') {
        // cd without args goes to home directory
        this.terminalContext.currentDirectory = 'C:\\Users\\kelle';
      } else {
        const path = command.substring(3).trim();
        // For simplicity, just track the path they tried to cd to
        // In a full implementation, we'd resolve relative paths
        this.terminalContext.currentDirectory = path;
      }
    }
    
    // Handle pwd command output to get actual current directory
    if (cmd === 'pwd' && output) {
      const lines = output.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.includes('Path') && !trimmed.includes('---')) {
          this.terminalContext.currentDirectory = trimmed;
          break;
        }
      }
    }
  }
  
  /**
   * Clear terminal context (called when terminal is cleared)
   */
  clearTerminalContext() {
    // Safety check - initialize if needed
    if (!this.terminalContext) {
      this.terminalContext = {
        recentCommands: [],
        currentDirectory: 'C:\\Users\\kelle',
        lastError: null,
        maxCommands: 10
      };
    } else {
      this.terminalContext.recentCommands = [];
      this.terminalContext.lastError = null;
    }
    console.log('Terminal context cleared');
  }
  
  /**
   * Generate context string for AI requests
   */
  generateAIContext() {
    // Safety check - initialize if needed
    if (!this.terminalContext) {
      console.log('WARNING: terminalContext not initialized, creating default');
      this.terminalContext = {
        recentCommands: [],
        currentDirectory: 'C:\\Users\\kelle',
        lastError: null,
        maxCommands: 10
      };
    }
    
    if (this.terminalContext.recentCommands.length === 0) {
      return '';
    }
    
    let context = `Terminal Context:\nCurrent Directory: ${this.terminalContext.currentDirectory}\n\nRecent Commands:\n`;
    
    // Add recent commands in reverse order (most recent first)
    const recentCommands = this.terminalContext.recentCommands.slice(-5); // Last 5 commands
    for (let i = recentCommands.length - 1; i >= 0; i--) {
      const entry = recentCommands[i];
      context += `$ ${entry.command}\n`;
      if (entry.output) {
        context += entry.output + '\n';
      }
      if (entry.isError) {
        context += '[ERROR]\n';
      }
      context += '\n';
    }
    
    return context;
  }

  /**
   * Add command to appropriate history
   */
  addToHistory(command) {
    // Initialize arrays if they don't exist (safety check)
    if (!this.commandHistory) {
      console.log('Initializing command history');
      this.commandHistory = [];
    }
    if (!this.shellHistory) {
      console.log('Initializing shell history');
      this.shellHistory = [];
    }
    
    if (!command || command.trim().length === 0) return;
    
    const trimmedCommand = command.trim();
    const isSlashCommand = trimmedCommand.startsWith('/');
    const history = isSlashCommand ? this.commandHistory : this.shellHistory;
    
    // Don't add duplicate consecutive commands
    if (history.length === 0 || history[history.length - 1] !== trimmedCommand) {
      history.push(trimmedCommand);
      console.log(`Added to ${isSlashCommand ? 'command' : 'shell'} history: "${trimmedCommand}"`);
    }
    
    // Reset history navigation state
    this.currentHistoryIndex = -1;
    this.originalCommand = '';
    this.isNavigatingHistory = false;
  }

  setupWindowControls() {
    const minimizeBtn = document.getElementById('minimize');
    const maximizeBtn = document.getElementById('maximize');
    const closeBtn = document.getElementById('close');
    
    minimizeBtn?.addEventListener('click', () => {
      console.log('Minimize clicked');
    });
    
    maximizeBtn?.addEventListener('click', () => {
      console.log('Maximize clicked');
    });
    
    closeBtn?.addEventListener('click', () => {
      window.close();
    });
  }
  
  focus() {
    this.terminal.focus();
  }
  
  dispose() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    this.terminal.dispose();
    if (this.catOverlay) {
      this.catOverlay.dispose();
    }
  }
}

// Main Application class
class CatTerminalApp {
  constructor() {
    this.terminal = null;
    
    // Command input state
    this.currentCommand = '';
    
    // Command history management
    this.commandHistory = [];        // For /commands
    this.shellHistory = [];          // For shell commands
    this.currentHistoryIndex = -1;
    this.originalCommand = '';
    this.isNavigatingHistory = false;
    
    // Terminal context for AI integration
    this.terminalContext = {
      recentCommands: [],           // Recent commands with outputs
      currentDirectory: 'C:\\Users\\kelle', // Current working directory
      lastError: null,              // Most recent error for context
      maxCommands: 10               // Maximum commands to keep in context
    };
    
    // Command output tracking
    this.pendingCommand = null;     // Command waiting for output
    this.commandOutput = '';        // Accumulated output for current command
    this.commandStartTime = null;   // When command started executing
    
    this.init();
  }
  
  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }
  
  async start() {
    try {
      // Get terminal container
      const container = document.getElementById('terminal-container');
      if (!container) {
        throw new Error('Terminal container not found');
      }
      
      // Create terminal session
      this.terminal = new TerminalSession(container, 'main-terminal');
      
      // Focus terminal
      setTimeout(() => {
        this.terminal?.focus();
      }, 100);
      
      // Handle app version display
      this.displayAppInfo();
      
    } catch (error) {
      console.error('Failed to initialize Cat Terminal:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  async displayAppInfo() {
    try {
      const version = await window.app?.getVersion();
      const title = document.getElementById('title');
      if (title && version) {
        title.textContent = `Cat Terminal v${version}`;
      }
    } catch (error) {
      console.warn('Could not get app version:', error);
    }
  }
  
  showError(message) {
    const container = document.getElementById('terminal-container');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ff6b6b;
          font-family: monospace;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <h3>❌ Error</h3>
            <p style="margin-top: 10px;">${message}</p>
            <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
              Check the console for more details
            </p>
          </div>
        </div>
      `;
    }
  }
  
  dispose() {
    this.terminal?.dispose();
  }
}

// Initialize terminal application when DOM is ready
let catTerminal;

function initApp() {
  console.log('Initializing Cat Terminal application...');
  catTerminal = new CatTerminalApp();
  
  // Cleanup on window close
  window.addEventListener('beforeunload', () => {
    catTerminal.dispose();
  });
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
