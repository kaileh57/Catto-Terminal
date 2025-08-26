import { TerminalSession } from './terminal';

class CatTerminalApp {
  private terminal: TerminalSession | null = null;
  
  constructor() {
    this.init();
  }
  
  private async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }
  
  private async start() {
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
  
  private async displayAppInfo() {
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
  
  private showError(message: string) {
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
  
  // Cleanup on app close
  public dispose() {
    this.terminal?.dispose();
  }
}

// Initialize terminal application
const catTerminal = new CatTerminalApp();

// Cleanup on window close
window.addEventListener('beforeunload', () => {
  catTerminal.dispose();
});