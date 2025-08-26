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
  rightClickSelectsWord: false, // Ensure proper backspace handling
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
    
    console.log('Creating terminal session:', id);
    
    // Initialize xterm with explicit dimensions and Windows-compatible settings
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
      allowProposedApi: true
    });
    
    // Add fit addon
    this.fitAddon = new FitAddon.FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    
    // Open terminal in container
    this.terminal.open(container);
    
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
      
      // Track current command being typed
      let currentCommand = '';
      
      // Send data to PTY
      const inputDisposable = this.terminal.onData((data) => {
        // CRITICAL FIX: Add empty string detection & blocking at the very beginning
        if (data === '' || data.length === 0) {
          console.error('DETECTED EMPTY STRING INPUT - BLOCKING');
          console.error('Stack trace:', new Error().stack);
          return; // Don't send empty strings to terminal
        }
        
        // Enhanced detailed character code logging
        console.log(`Input data: "${data}", length: ${data.length}, char codes:`, 
          Array.from(data).map(c => c.charCodeAt(0)));
        console.log(`Sending input to terminal ${this.id}:`, JSON.stringify(data));
        
        // Handle special keys for command interception
        if (data === '\r') { // Enter key
          // Check for command interception first
          const trimmedCommand = currentCommand.trim();
          
          // Try to intercept as a /command
          if (this.commandInterceptor && trimmedCommand) {
            const commandResult = this.commandInterceptor.interceptCommand(trimmedCommand);
            
            if (commandResult) {
              // This is a command, handle it instead of sending to shell
              // First send the enter key to complete the current line visually
              window.terminal.write(this.id, data);
              this.handleCommand(commandResult);
              currentCommand = ''; // Reset command buffer
              return; // Don't send to shell again
            }
          }
          
          currentCommand = ''; // Reset command buffer after any enter key
        } else if (data === '\x7f' || data === '\x08') { // Backspace or delete
          console.log('Detected backspace character:', JSON.stringify(data));
          console.log('Backspace char code:', data.charCodeAt(0));
          console.log('Command buffer before backspace:', JSON.stringify(currentCommand));
          
          // Handle backspace ONLY on the display side - don't send to shell yet
          if (currentCommand.length > 0) {
            // Update our command buffer
            currentCommand = currentCommand.slice(0, -1);
            
            // Handle display erasure directly - move cursor back and erase character
            this.terminal.write('\x08 \x08');
            
            console.log('Command buffer after backspace:', JSON.stringify(currentCommand));
            console.log('Handled backspace on display side only');
          } else {
            console.log('Blocked backspace - no characters in command buffer to delete');
          }
          
          // Make cat react to typing
          if (this.catOverlay && data) {
            this.catOverlay.onUserTyping();
          }
          return; // Don't send backspace to shell - handle locally only
        } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) < 127) { // Printable characters
          currentCommand += data;
        }
        
        // CRITICAL FIX: Double-check empty strings (redundant safety check)
        if (data === '' || data.length === 0) {
          console.error('DETECTED EMPTY STRING - this is the bug! Not sending to terminal');
          console.error('Current command buffer:', currentCommand);
          console.error('Data type:', typeof data);
          console.error('Data === "":', data === '');
          console.error('Data.length:', data.length);
          console.error('Stack trace:', new Error().stack);
          return; // Don't send empty strings to the shell
        }
        
        // Windows-specific backspace handling - Convert DEL to BS for PowerShell compatibility
        let processedData = data;
        if (data === '\x7f') {
          // Convert DEL to BS for Windows PowerShell compatibility  
          processedData = '\x08'; // Convert DEL to BS
          console.log('Converted DEL to BS for Windows');
          console.log('Original char code:', data.charCodeAt(0), 'New char code:', processedData.charCodeAt(0));
        }
        
        // Final validation before sending
        if (processedData === '' || processedData.length === 0) {
          console.error('PROCESSED DATA IS EMPTY - BLOCKING SEND');
          console.error('Original data:', JSON.stringify(data));
          console.error('Processed data:', JSON.stringify(processedData));
          return;
        }
        
        // Send all data to PTY except backspace (which is handled above)
        window.terminal.write(this.id, processedData);
        
        // Make cat react to typing
        if (this.catOverlay && data && data !== '\r') {
          this.catOverlay.onUserTyping();
        }
        
        // Check for enter key (command execution)
        if (data === '\r' && this.catOverlay) {
          // Get the current line to see what command was typed
          const buffer = this.terminal.buffer.active;
          const cursorY = buffer.cursorY;
          const line = buffer.getLine(cursorY);
          if (line) {
            const command = line.translateToString(true).trim();
            if (command) {
              this.catOverlay.onCommandExecuted(command);
            }
          }
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
        
      case 'error':
        this.terminal.write(`\r\n\x1b[31m${commandResult.message}\x1b[0m\r\n`);
        break;
        
      default:
        this.terminal.write(`\r\n\x1b[33mCommand not implemented yet: ${commandResult.type}\x1b[0m\r\n`);
    }
  }

  /**
   * Handle /cat command
   */
  handleCatAsk(prompt) {
    this.terminal.write(`\r\n\x1b[36mAsking cat: ${prompt}\x1b[0m\r\n`);
    
    if (this.catOverlay) {
      this.catOverlay.setState('thinking', 'Let me think...');
      
      // Simulate AI response for now
      setTimeout(() => {
        const responses = [
          "Meow! That's interesting...",
          "Purr... I think you should try that!",
          "Hiss! I don't like that idea.",
          "*stretches* Maybe later, human.",
          "Mrow! Good question!"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.catOverlay.setState('love', response);
        this.terminal.write(`\x1b[32mCat says: ${response}\x1b[0m\r\n`);
        
        setTimeout(() => {
          this.catOverlay.setState('idle');
        }, 5000);
      }, 2000);
    } else {
      this.terminal.write(`\x1b[33mCat overlay not available\x1b[0m\r\n`);
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
            this.terminal.write(`\r\n\x1b[32mCat overlay shown\x1b[0m\r\n`);
            break;
          case 'text':
            // Future: switch to text-only mode
            this.terminal.write(`\r\n\x1b[33mText-only mode not implemented yet\x1b[0m\r\n`);
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
