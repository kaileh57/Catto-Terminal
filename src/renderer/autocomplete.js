// Command Autocomplete for Cat Terminal
// Claude Code style autocomplete dropdown for / commands

class CommandAutocomplete {
  constructor(terminalElement) {
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
    
    this.dropdown = null;
    this.isVisible = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];
    this.terminalElement = terminalElement;
    
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
    // Only show for commands that start with /
    if (!inputText.startsWith('/')) {
      this.hide();
      return;
    }
    
    const query = inputText.slice(1).trim(); // Remove '/' prefix
    const parts = query.split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    
    // If we have a command and arguments, show parameter suggestions
    if (parts.length > 1) {
      this.showParameterSuggestions(command, args, cursorPosition);
      return;
    }
    
    // Otherwise show command suggestions
    this.filteredCommands = this.filterCommands(query);
    
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
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    );
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
    this.dropdown.innerHTML = this.filteredCommands.map((cmd, index) => `
      <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}" 
           data-index="${index}">
        <div class="command-name">/${cmd.name}</div>
        <div class="command-description">${cmd.description}</div>
        <div class="command-usage">${cmd.usage}</div>
      </div>
    `).join('');
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
      // For parameter suggestions, complete with the full command
      // For regular commands, complete with just the command name
      const completionText = command.name.startsWith('/') ? command.name.slice(1) : command.name;
      
      if (this.onComplete) {
        this.onComplete(completionText);
      }
      this.hide();
      return true;
    }
    return false;
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

/* Scrollbar styling */
.command-autocomplete::-webkit-scrollbar {
  width: 6px;
}

.command-autocomplete::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.command-autocomplete::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.command-autocomplete::-webkit-scrollbar-thumb:hover {
  background: #666;
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