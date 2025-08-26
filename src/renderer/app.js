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
  allowProposedApi: false,
  convertEol: true,
  disableStdin: false,
  allowTransparency: false,
  drawBoldTextInBrightColors: true,
  fastScrollModifier: 'alt',
  macOptionIsMeta: false,
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
    
    // Initialize xterm with explicit dimensions
    this.terminal = new Terminal({
      ...TERMINAL_OPTIONS,
      theme: TERMINAL_OPTIONS.theme,
      cols: 80,
      rows: 24
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
        console.log(`Sending input to terminal ${this.id}:`, JSON.stringify(data));
        
        // Handle special keys for clear command
        if (data === '\r') { // Enter key
          // Check if user typed clear or cls
          const trimmedCommand = currentCommand.trim().toLowerCase();
          if (trimmedCommand === 'clear' || trimmedCommand === 'cls') {
            // Clear the terminal screen locally
            this.terminal.clear();
          }
          currentCommand = ''; // Reset command buffer
        } else if (data === '\x7f' || data === '\x08') { // Backspace or delete
          if (currentCommand.length > 0) {
            currentCommand = currentCommand.slice(0, -1);
          }
        } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) < 127) { // Printable characters
          currentCommand += data;
        }
        
        // Send all data to PTY
        window.terminal.write(this.id, data);
        
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
