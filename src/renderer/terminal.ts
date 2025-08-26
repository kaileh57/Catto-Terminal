import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { TERMINAL_OPTIONS, THEME } from '../shared/constants';

export class TerminalSession {
  private terminal: Terminal;
  private fitAddon: FitAddon;
  private id: string;
  private cleanupFunctions: (() => void)[] = [];
  
  constructor(container: HTMLElement, id: string) {
    this.id = id;
    
    // Initialize xterm
    this.terminal = new Terminal({
      fontFamily: TERMINAL_OPTIONS.fontFamily,
      fontSize: TERMINAL_OPTIONS.fontSize,
      theme: THEME.dark,
      cursorBlink: TERMINAL_OPTIONS.cursorBlink,
      cursorStyle: 'block',
      scrollback: TERMINAL_OPTIONS.scrollback,
      allowProposedApi: true,
    });
    
    // Add addons
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    
    // Open terminal in container
    this.terminal.open(container);
    this.fitAddon.fit();
    
    // Setup PTY connection
    this.setupPtyConnection();
    
    // Handle resize
    this.setupResizeHandler();
    
    // Handle window controls
    this.setupWindowControls();
  }
  
  private async setupPtyConnection() {
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
      const dataCleanup = window.terminal.onData(this.id, (data: string) => {
        console.log(`Terminal ${this.id} received data:`, data);
        this.terminal.write(data);
      });
      if (dataCleanup) {
        this.cleanupFunctions.push(dataCleanup);
      }
      
      // Send data to PTY
      const inputDisposable = this.terminal.onData((data: string) => {
        console.log(`Sending input to terminal ${this.id}:`, JSON.stringify(data));
        window.terminal.write(this.id, data);
      });
      this.cleanupFunctions.push(() => inputDisposable.dispose());
      
      // Handle exit
      const exitCleanup = window.terminal.onExit(this.id, () => {
        this.terminal.write('\\r\\n[Process exited]');
      });
      if (exitCleanup) {
        this.cleanupFunctions.push(exitCleanup);
      }
      
    } catch (error) {
      console.error('Failed to setup PTY connection:', error);
      this.terminal.write('\\r\\nError: Failed to create terminal session\\r\\n');
    }
  }
  
  private setupResizeHandler() {
    const resizeObserver = new ResizeObserver(() => {
      this.fitAddon.fit();
      const { cols, rows } = this.terminal;
      window.terminal.resize(this.id, cols, rows);
    });
    
    if (this.terminal.element) {
      resizeObserver.observe(this.terminal.element);
      this.cleanupFunctions.push(() => resizeObserver.disconnect());
    }
  }
  
  private setupWindowControls() {
    const minimizeBtn = document.getElementById('minimize');
    const maximizeBtn = document.getElementById('maximize');
    const closeBtn = document.getElementById('close');
    
    minimizeBtn?.addEventListener('click', () => {
      // Note: Window control functionality would need additional IPC handlers
      console.log('Minimize clicked');
    });
    
    maximizeBtn?.addEventListener('click', () => {
      console.log('Maximize clicked');
    });
    
    closeBtn?.addEventListener('click', () => {
      window.close();
    });
  }
  
  public focus() {
    this.terminal.focus();
  }
  
  public dispose() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    this.terminal.dispose();
  }
}