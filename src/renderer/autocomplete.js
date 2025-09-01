// Command Autocomplete for Cat Terminal
// Claude Code style autocomplete dropdown for / commands

class CommandAutocomplete {
  constructor(terminalElement) {
    // Terminal reference for context
    this.terminalElement = terminalElement;
    this.terminalSession = null; // Will be set by app
    
    // Slash commands
    this.commands = [
      { 
        name: 'cat', 
        description: 'Ask the cat a question using AI', 
        usage: '/cat "your question here"',
        params: ['question']
      },
      { 
        name: 'toggle', 
        description: 'Toggle cat visibility or markdown rendering', 
        usage: '/toggle cat on|off|text or /toggle markdown on|off',
        params: ['target', 'mode']
      },
      { 
        name: 'setup', 
        description: 'Configure API keys and settings', 
        usage: '/setup key|prompt|status',
        params: ['subcommand']
      },
      { 
        name: 'model', 
        description: 'Switch AI model or list available models', 
        usage: '/model [name] or /model for list',
        params: ['model-name']
      },
      { 
        name: 'spawn', 
        description: 'Create a new AI agent (future feature)', 
        usage: '/spawn -n <name> -m <model>',
        params: ['-n', 'name', '-m', 'model']
      },
      { 
        name: 'ask', 
        description: 'Ask a specific agent (future feature)', 
        usage: '/ask @agent-name "question"',
        params: ['@agent', 'question']
      },
      { 
        name: 'help', 
        description: 'Show help for commands', 
        usage: '/help [command]',
        params: ['command']
      }
    ];
    
    // Windows/PowerShell commands - common utilities and cmdlets
    this.windowsCommands = [
      // File and directory operations
      { name: 'ls', description: 'List directory contents (alias for Get-ChildItem)', usage: 'ls [path]' },
      { name: 'dir', description: 'List directory contents', usage: 'dir [path]' },
      { name: 'cd', description: 'Change directory', usage: 'cd <path>' },
      { name: 'pwd', description: 'Print working directory', usage: 'pwd' },
      { name: 'mkdir', description: 'Create directory', usage: 'mkdir <name>' },
      { name: 'rmdir', description: 'Remove directory', usage: 'rmdir <name>' },
      { name: 'copy', description: 'Copy files', usage: 'copy <source> <destination>' },
      { name: 'move', description: 'Move files', usage: 'move <source> <destination>' },
      { name: 'del', description: 'Delete files', usage: 'del <file>' },
      { name: 'type', description: 'Display file contents', usage: 'type <file>' },
      
      // PowerShell cmdlets
      { name: 'Get-ChildItem', description: 'Get items in directory', usage: 'Get-ChildItem [path]' },
      { name: 'Set-Location', description: 'Change current location', usage: 'Set-Location <path>' },
      { name: 'Get-Location', description: 'Get current location', usage: 'Get-Location' },
      { name: 'New-Item', description: 'Create new item', usage: 'New-Item -ItemType <type> -Name <name>' },
      { name: 'Remove-Item', description: 'Remove item', usage: 'Remove-Item <path>' },
      { name: 'Copy-Item', description: 'Copy item', usage: 'Copy-Item <source> <destination>' },
      { name: 'Move-Item', description: 'Move item', usage: 'Move-Item <source> <destination>' },
      { name: 'Get-Content', description: 'Get file contents', usage: 'Get-Content <file>' },
      { name: 'Set-Content', description: 'Set file contents', usage: 'Set-Content <file> <content>' },
      { name: 'Out-File', description: 'Send output to file', usage: 'command | Out-File <file>' },
      
      // System information
      { name: 'Get-Process', description: 'Get running processes', usage: 'Get-Process [name]' },
      { name: 'Get-Service', description: 'Get system services', usage: 'Get-Service [name]' },
      { name: 'Get-ComputerInfo', description: 'Get computer information', usage: 'Get-ComputerInfo' },
      { name: 'Get-Date', description: 'Get current date and time', usage: 'Get-Date' },
      
      // Network commands
      { name: 'ping', description: 'Test network connectivity', usage: 'ping <hostname>' },
      { name: 'ipconfig', description: 'Display IP configuration', usage: 'ipconfig [options]' },
      { name: 'nslookup', description: 'Query DNS records', usage: 'nslookup <hostname>' },
      { name: 'netstat', description: 'Display network connections', usage: 'netstat [options]' },
      
      // Common utilities
      { name: 'cls', description: 'Clear screen', usage: 'cls' },
      { name: 'clear', description: 'Clear screen (alias)', usage: 'clear' },
      { name: 'echo', description: 'Display text', usage: 'echo <text>' },
      { name: 'where', description: 'Locate command', usage: 'where <command>' },
      { name: 'whoami', description: 'Display current user', usage: 'whoami' },
      { name: 'hostname', description: 'Display computer name', usage: 'hostname' },
      
      // Git commands (common in development)
      { name: 'git', description: 'Git version control', usage: 'git <subcommand>' },
      { name: 'npm', description: 'Node package manager', usage: 'npm <command>' },
      { name: 'node', description: 'Node.js runtime', usage: 'node <file>' },
      { name: 'python', description: 'Python interpreter', usage: 'python <file>' },
      { name: 'code', description: 'Visual Studio Code', usage: 'code [file]' }
    ];
    
    this.dropdown = null;
    this.isVisible = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];
    this.currentMode = 'commands'; // 'commands', 'windows', 'history', 'paths'
    this.commandHistory = []; // Will be populated from terminal session
    
    this.createDropdown();
    this.attachEventListeners();
  }
  
  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'command-autocomplete';
    this.dropdown.style.cssText = `
      position: absolute;
      background: #2d2d2d;
      border: 1px solid #404040;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      font-family: 'Cascadia Code', 'Consolas', monospace;
      font-size: 13px;
      display: none;
      min-width: 400px;
    `;
    
    document.body.appendChild(this.dropdown);
  }
  
  attachEventListeners() {
    // Click to select item
    this.dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.autocomplete-item');
      if (item) {
        const index = parseInt(item.dataset.index);
        this.selectedIndex = index;
        this.completeCommand();
      }
    });
    
    // Mouse hover to highlight
    this.dropdown.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.autocomplete-item');
      if (item) {
        this.selectedIndex = parseInt(item.dataset.index);
        this.renderDropdown();
      }
    });
  }
  
  show(inputText, cursorPosition) {
    const trimmedInput = inputText.trim();
    
    // Handle slash commands
    if (trimmedInput.startsWith('/')) {
      this.currentMode = 'commands';
      const query = trimmedInput.slice(1).trim(); // Remove '/' prefix
      const parts = query.split(' ');
      const command = parts[0];
      const args = parts.slice(1);
      
      // If we have a command and arguments, show parameter suggestions
      if (parts.length > 1) {
        this.showParameterSuggestions(command, args, cursorPosition);
        return;
      }
      
      // Otherwise show slash command suggestions
      this.filteredCommands = this.filterCommands(query);
    }
    // Handle Windows commands and utilities
    else if (trimmedInput.length > 0) {
      this.currentMode = 'windows';
      this.filteredCommands = this.filterWindowsCommands(trimmedInput);
      
      // Also include recent command history
      const historyMatches = this.filterCommandHistory(trimmedInput);
      this.filteredCommands = [...this.filteredCommands, ...historyMatches];
      
      // Remove duplicates and limit results
      this.filteredCommands = this.removeDuplicates(this.filteredCommands).slice(0, 10);
    }
    else {
      this.hide();
      return;
    }
    
    if (this.filteredCommands.length > 0) {
      this.selectedIndex = 0; // Reset selection to first item
      this.renderDropdown();
      this.positionDropdown(cursorPosition);
      this.isVisible = true;
      this.dropdown.style.display = 'block';
    } else {
      this.hide();
    }
  }
  
  hide() {
    if (this.isVisible) {
      this.isVisible = false;
      this.dropdown.style.display = 'none';
      this.selectedIndex = 0;
      this.filteredCommands = [];
    }
  }
  
  filterCommands(query) {
    if (!query) return this.commands;
    
    return this.commands.filter(cmd =>
      this.fuzzyMatch(cmd.name, query) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bExact = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  
  filterWindowsCommands(query) {
    if (!query) return [];
    
    return this.windowsCommands.filter(cmd =>
      this.fuzzyMatch(cmd.name, query) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bExact = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0, 8); // Limit Windows commands to avoid overwhelming
  }
  
  filterCommandHistory(query) {
    if (!query || !this.commandHistory.length) return [];
    
    const matches = [];
    const uniqueCommands = new Set();
    
    // Search through history in reverse (most recent first)
    for (let i = this.commandHistory.length - 1; i >= 0; i--) {
      const historyItem = this.commandHistory[i];
      if (historyItem && 
          this.fuzzyMatch(historyItem, query) && 
          !uniqueCommands.has(historyItem) &&
          matches.length < 3) { // Limit history suggestions
        
        matches.push({
          name: historyItem,
          description: '📜 From command history',
          usage: historyItem,
          isHistory: true
        });
        uniqueCommands.add(historyItem);
      }
    }
    
    return matches;
  }
  
  // Improved fuzzy matching algorithm
  fuzzyMatch(text, query) {
    if (!text || !query) return false;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact substring match gets highest priority
    if (textLower.includes(queryLower)) return true;
    
    // Check if query characters appear in order (fuzzy match)
    let textIndex = 0;
    for (let queryIndex = 0; queryIndex < queryLower.length; queryIndex++) {
      const queryChar = queryLower[queryIndex];
      const foundIndex = textLower.indexOf(queryChar, textIndex);
      if (foundIndex === -1) return false;
      textIndex = foundIndex + 1;
    }
    
    return true;
  }
  
  removeDuplicates(commands) {
    const seen = new Set();
    return commands.filter(cmd => {
      const key = cmd.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  showParameterSuggestions(command, args, cursorPosition) {
    const suggestions = this.getParameterSuggestions(command, args);
    
    if (suggestions.length > 0) {
      this.filteredCommands = suggestions;
      this.selectedIndex = 0;
      this.renderDropdown();
      this.positionDropdown(cursorPosition);
      this.isVisible = true;
      this.dropdown.style.display = 'block';
    } else {
      this.hide();
    }
  }
  
  getParameterSuggestions(command, args) {
    const cmd = this.commands.find(c => c.name === command);
    if (!cmd) return [];
    
    switch (command) {
      case 'toggle':
        if (args.length === 0) {
          return [
            { name: 'toggle cat', description: 'Toggle cat visibility', usage: '/toggle cat on|off|text' },
            { name: 'toggle markdown', description: 'Toggle markdown rendering', usage: '/toggle markdown on|off' }
          ];
        } else if (args.length === 1) {
          const target = args[0];
          // Support partial matching for targets
          if (target === 'cat' || 'cat'.startsWith(target.toLowerCase())) {
            return [
              { name: 'toggle cat on', description: 'Show cat in visual mode', usage: '/toggle cat on' },
              { name: 'toggle cat off', description: 'Hide cat overlay', usage: '/toggle cat off' },
              { name: 'toggle cat text', description: 'Show cat in text-only mode', usage: '/toggle cat text' }
            ];
          } else if (target === 'markdown' || 'markdown'.startsWith(target.toLowerCase())) {
            return [
              { name: 'toggle markdown on', description: 'Enable markdown rendering', usage: '/toggle markdown on' },
              { name: 'toggle markdown off', description: 'Disable markdown rendering', usage: '/toggle markdown off' }
            ];
          } else {
            // Show both options if partial match
            const suggestions = [];
            if ('cat'.startsWith(target.toLowerCase())) {
              suggestions.push({ name: 'toggle cat', description: 'Toggle cat visibility', usage: '/toggle cat on|off|text' });
            }
            if ('markdown'.startsWith(target.toLowerCase())) {
              suggestions.push({ name: 'toggle markdown', description: 'Toggle markdown rendering', usage: '/toggle markdown on|off' });
            }
            return suggestions;
          }
        }
        break;
        
      case 'setup':
        if (args.length === 0) {
          return [
            { name: 'setup key', description: 'Configure API keys', usage: '/setup key openrouter' },
            { name: 'setup prompt', description: 'Configure system prompts', usage: '/setup prompt [preset]' },
            { name: 'setup status', description: 'Check configuration status', usage: '/setup status' }
          ];
        } else if (args.length === 1) {
          const subcommand = args[0];
          if (subcommand === 'key') {
            return [
              { name: 'setup key openrouter', description: 'Set OpenRouter API key', usage: '/setup key openrouter' }
            ];
          } else if (subcommand === 'prompt') {
            return [
              { name: 'setup prompt professional', description: 'Professional assistant style', usage: '/setup prompt professional' },
              { name: 'setup prompt casual', description: 'Casual conversation style', usage: '/setup prompt casual' },
              { name: 'setup prompt developer', description: 'Code-focused technical style', usage: '/setup prompt developer' },
              { name: 'setup prompt playful', description: 'Fun cat personality', usage: '/setup prompt playful' },
              { name: 'setup prompt custom', description: 'Set custom prompt', usage: '/setup prompt custom' },
              { name: 'setup prompt default', description: 'Reset to original cat assistant', usage: '/setup prompt default' },
              { name: 'setup prompt preview', description: 'Preview prompt effects', usage: '/setup prompt preview [preset]' }
            ];
          }
        } else if (args.length === 2 && args[0] === 'prompt' && args[1] === 'preview') {
          return [
            { name: 'setup prompt preview professional', description: 'Preview professional style', usage: '/setup prompt preview professional' },
            { name: 'setup prompt preview casual', description: 'Preview casual style', usage: '/setup prompt preview casual' },
            { name: 'setup prompt preview developer', description: 'Preview developer style', usage: '/setup prompt preview developer' },
            { name: 'setup prompt preview playful', description: 'Preview playful style', usage: '/setup prompt preview playful' },
            { name: 'setup prompt preview default', description: 'Preview default style', usage: '/setup prompt preview default' }
          ];
        }
        break;
        
      case 'model':
        if (args.length === 0) {
          return [
            { name: 'model haiku', description: 'Fast and efficient (default)', usage: '/model haiku' },
            { name: 'model sonnet', description: 'Powerful but slower', usage: '/model sonnet' },
            { name: 'model gpt-4', description: 'OpenAI GPT-4', usage: '/model gpt-4' },
            { name: 'model llama-3.1-70b', description: 'Meta Llama 3.1 70B', usage: '/model llama-3.1-70b' },
            { name: 'model deepseek-r1', description: 'DeepSeek R1 model', usage: '/model deepseek-r1' }
          ];
        }
        break;
        
      case 'help':
        if (args.length === 0) {
          return this.commands.map(cmd => ({
            name: `help ${cmd.name}`,
            description: `Get help for /${cmd.name}`,
            usage: `/help ${cmd.name}`
          }));
        }
        break;
    }
    
    return [];
  }
  
  renderDropdown() {
    this.dropdown.innerHTML = this.filteredCommands.map((cmd, index) => {
      const prefix = this.currentMode === 'commands' ? '/' : '';
      const nameClass = cmd.isHistory ? 'command-name history' : 'command-name';
      const icon = cmd.isHistory ? '📜 ' : '';
      
      return `
        <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}" 
             data-index="${index}">
          <div class="${nameClass}">${icon}${prefix}${cmd.name}</div>
          <div class="command-description">${cmd.description}</div>
          <div class="command-usage">${cmd.usage}</div>
        </div>
      `;
    }).join('');
  }
  
  positionDropdown(cursorPosition) {
    // Position the dropdown near the cursor but ensure it stays on screen
    const rect = this.terminalElement.getBoundingClientRect();
    const dropdownHeight = Math.min(300, this.filteredCommands.length * 70); // Rough estimate
    
    let left = cursorPosition.x + rect.left;
    let top = cursorPosition.y + rect.top + 20; // Offset below cursor
    
    // Ensure dropdown doesn't go off screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    if (left + 400 > screenWidth) {
      left = screenWidth - 410; // Account for dropdown width + margin
    }
    
    if (top + dropdownHeight > screenHeight) {
      top = cursorPosition.y + rect.top - dropdownHeight - 5; // Show above cursor
    }
    
    this.dropdown.style.left = left + 'px';
    this.dropdown.style.top = top + 'px';
  }
  
  handleKeyDown(event) {
    if (!this.isVisible) return false;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
        this.renderDropdown();
        return true;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderDropdown();
        return true;
      case 'Tab':
      case 'Enter':
        event.preventDefault();
        return this.completeCommand();
      case 'Escape':
        event.preventDefault();
        this.hide();
        return true;
      default:
        return false;
    }
  }
  
  completeCommand() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredCommands.length) {
      const command = this.filteredCommands[this.selectedIndex];
      let completionText;
      
      if (this.currentMode === 'commands') {
        // For slash commands, complete with just the command name (no /)
        completionText = command.name.startsWith('/') ? command.name.slice(1) : command.name;
      } else {
        // For Windows commands and history, complete with the full name
        completionText = command.name;
      }
      
      if (this.onComplete) {
        this.onComplete(completionText);
      }
      this.hide();
      return true;
    }
    return false;
  }
  
  // Method to update command history from terminal session
  updateCommandHistory(shellHistory, commandHistory) {
    // Combine both shell and slash command histories
    this.commandHistory = [...(shellHistory || []), ...(commandHistory || [])];
    
    // Keep only the most recent 50 commands to avoid memory issues
    if (this.commandHistory.length > 50) {
      this.commandHistory = this.commandHistory.slice(-50);
    }
  }
  
  // Method to set terminal session reference
  setTerminalSession(terminalSession) {
    this.terminalSession = terminalSession;
    
    // Update command history if available
    if (terminalSession && terminalSession.shellHistory && terminalSession.commandHistory) {
      this.updateCommandHistory(terminalSession.shellHistory, terminalSession.commandHistory);
    }
  }
  
  // Basic path completion for file/directory arguments
  async getPathCompletions(partialPath) {
    if (!window.terminal) return [];
    
    try {
      // For now, return some common paths that might exist
      // In a full implementation, this would query the file system
      const commonPaths = [
        { name: './', description: 'Current directory', usage: './' },
        { name: '../', description: 'Parent directory', usage: '../' },
        { name: '~/', description: 'Home directory', usage: '~/' },
        { name: 'Documents/', description: 'Documents folder', usage: 'Documents/' },
        { name: 'Desktop/', description: 'Desktop folder', usage: 'Desktop/' },
        { name: 'Downloads/', description: 'Downloads folder', usage: 'Downloads/' }
      ];
      
      if (!partialPath) return commonPaths;
      
      return commonPaths.filter(path => 
        this.fuzzyMatch(path.name, partialPath)
      );
      
    } catch (error) {
      console.error('Path completion error:', error);
      return [];
    }
  }
  
  // Enhanced parameter suggestions that includes path completion
  async getEnhancedParameterSuggestions(command, args) {
    const basicSuggestions = this.getParameterSuggestions(command, args);
    
    // For commands that take file/directory arguments, add path completion
    const pathCommands = ['cd', 'dir', 'ls', 'type', 'copy', 'move', 'del', 'Set-Location', 'Get-ChildItem', 'Get-Content'];
    
    if (pathCommands.includes(command) && args.length > 0) {
      const lastArg = args[args.length - 1];
      const pathCompletions = await this.getPathCompletions(lastArg);
      
      return [...basicSuggestions, ...pathCompletions];
    }
    
    return basicSuggestions;
  }
  
  // Method to set completion callback
  onCommandComplete(callback) {
    this.onComplete = callback;
  }
  
  // Cleanup method
  destroy() {
    if (this.dropdown) {
      this.dropdown.remove();
    }
  }
}

// CSS Styles
const autocompleteCSS = `
.command-autocomplete .autocomplete-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #404040;
  transition: background-color 0.15s ease;
}

.command-autocomplete .autocomplete-item:last-child {
  border-bottom: none;
}

.command-autocomplete .autocomplete-item.selected {
  background: #404040;
  border-left: 3px solid #4fc3f7;
}

.command-autocomplete .autocomplete-item:hover {
  background: #404040;
}

.command-autocomplete .command-name {
  color: #4fc3f7;
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 14px;
}

.command-autocomplete .command-name.history {
  color: #f0c674;
  font-weight: 500;
}

.command-autocomplete .command-description {
  color: #cccccc;
  font-size: 12px;
  margin-bottom: 2px;
}

.command-autocomplete .command-usage {
  color: #888888;
  font-size: 11px;
  font-style: italic;
}

/* Enhanced visual hierarchy */
.command-autocomplete .autocomplete-item.selected .command-name {
  color: #ffffff;
}

.command-autocomplete .autocomplete-item.selected .command-description {
  color: #e8e8e8;
}

.command-autocomplete .autocomplete-item.selected .command-usage {
  color: #aaaaaa;
}

/* Improved scrollbar styling */
.command-autocomplete::-webkit-scrollbar {
  width: 6px;
}

.command-autocomplete::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 3px;
}

.command-autocomplete::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.command-autocomplete::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Add subtle animation */
.command-autocomplete {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Add CSS to page
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = autocompleteCSS;
  document.head.appendChild(style);
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CommandAutocomplete = CommandAutocomplete;
}