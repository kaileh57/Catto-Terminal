// Command Interceptor for Cat Terminal
// Handles /command syntax similar to Claude Code

class CommandInterceptor {
  constructor() {
    this.COMMAND_PREFIX = '/';
  }

  /**
   * Check if input is a command and intercept it
   * @param {string} input - The user input
   * @returns {CommandResult|null} - Parsed command or null if not a command
   */
  interceptCommand(input) {
    const trimmedInput = input.trim();
    
    if (!trimmedInput.startsWith(this.COMMAND_PREFIX)) {
      return null; // Not a command, pass through to shell
    }

    const commandLine = trimmedInput.slice(1).trim(); // Remove '/' prefix
    return this.parseCommand(commandLine);
  }

  /**
   * Parse the command line into command and arguments
   * @param {string} commandLine - Command without the / prefix
   * @returns {CommandResult} - Parsed command result
   */
  parseCommand(commandLine) {
    if (!commandLine) {
      return { 
        type: 'error', 
        message: 'Empty command. Type /help for available commands.' 
      };
    }

    const parts = this.parseCommandLine(commandLine);
    const [command, ...args] = parts;

    switch (command.toLowerCase()) {
      case 'cat':
        return this.parseCatCommand(args);
      case 'toggle':
        return this.parseToggleCommand(args);
      case 'help':
        return this.parseHelpCommand(args);
      case 'spawn':
        return this.parseSpawnCommand(args);
      case 'ask':
        return this.parseAskCommand(args);
      default:
        return {
          type: 'error',
          message: `Unknown command: ${command}. Type /help for available commands.`
        };
    }
  }

  /**
   * Parse command line respecting quotes
   * @param {string} commandLine 
   * @returns {string[]}
   */
  parseCommandLine(commandLine) {
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < commandLine.length; i++) {
      const char = commandLine[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      args.push(current);
    }

    return args;
  }

  /**
   * Parse /cat command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseCatCommand(args) {
    if (args.length === 0) {
      return {
        type: 'error',
        message: 'Cat command requires a question. Usage: /cat "your question here"'
      };
    }

    const prompt = args.join(' ');
    return {
      type: 'cat-ask',
      prompt: prompt
    };
  }

  /**
   * Parse /toggle command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseToggleCommand(args) {
    if (args.length < 2) {
      return {
        type: 'error',
        message: 'Toggle command requires target and value. Usage: /toggle cat on|off|text'
      };
    }

    const [target, value] = args;
    
    if (target !== 'cat') {
      return {
        type: 'error',
        message: 'Currently only "cat" can be toggled. Usage: /toggle cat on|off|text'
      };
    }

    if (!['on', 'off', 'text'].includes(value.toLowerCase())) {
      return {
        type: 'error',
        message: 'Invalid toggle value. Use: on, off, or text'
      };
    }

    return {
      type: 'toggle',
      target: target,
      value: value.toLowerCase()
    };
  }

  /**
   * Parse /help command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseHelpCommand(args) {
    return {
      type: 'help',
      command: args[0] || null
    };
  }

  /**
   * Parse /spawn command (for future agent system)
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseSpawnCommand(args) {
    // Parse flags: -n name, -m model, --role role, --caps capabilities
    const flags = this.parseFlags(args);
    
    return {
      type: 'spawn-agent',
      name: flags.n || flags.name || this.generateAgentName(),
      model: flags.m || flags.model || 'claude',
      role: flags.role || 'coder',
      capabilities: flags.caps ? flags.caps.split(',') : ['read']
    };
  }

  /**
   * Parse /ask command (for future agent system)
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseAskCommand(args) {
    if (args.length === 0) {
      return {
        type: 'error',
        message: 'Ask command requires an agent and question. Usage: /ask @agent-name "your question"'
      };
    }

    const agentName = args[0]?.startsWith('@') ? args[0].slice(1) : args[0];
    const prompt = args.slice(1).join(' ');

    if (!prompt) {
      return {
        type: 'error',
        message: 'Ask command requires a question. Usage: /ask @agent-name "your question"'
      };
    }

    return {
      type: 'ask-agent',
      agent: agentName,
      prompt: prompt
    };
  }

  /**
   * Parse command line flags (simple implementation)
   * @param {string[]} args 
   * @returns {object}
   */
  parseFlags(args) {
    const flags = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[i + 1];
        if (value && !value.startsWith('-')) {
          flags[key] = value;
          i++; // Skip the value
        } else {
          flags[key] = true;
        }
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        const value = args[i + 1];
        if (value && !value.startsWith('-')) {
          flags[key] = value;
          i++; // Skip the value
        } else {
          flags[key] = true;
        }
      }
    }
    
    return flags;
  }

  /**
   * Generate a random agent name
   * @returns {string}
   */
  generateAgentName() {
    const adjectives = ['clever', 'swift', 'bright', 'wise', 'sharp'];
    const nouns = ['cat', 'fox', 'owl', 'raven', 'wolf'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}-${noun}`;
  }

  /**
   * Get help text for commands
   * @param {string|null} command - Specific command to get help for
   * @returns {string}
   */
  getHelpText(command) {
    const helpTexts = {
      cat: '/cat "question" - Ask the cat a question using AI',
      toggle: '/toggle cat on|off|text - Toggle cat overlay visibility',
      spawn: '/spawn -n name -m model - Create a new AI agent (future)',
      ask: '/ask @agent "question" - Ask a specific agent (future)',
      help: '/help [command] - Show help for all commands or specific command'
    };

    if (command && helpTexts[command]) {
      return helpTexts[command];
    }

    return Object.entries(helpTexts)
      .map(([cmd, desc]) => `  ${desc}`)
      .join('\n');
  }
}

// Make available globally for the terminal app
if (typeof window !== 'undefined') {
  window.CommandInterceptor = CommandInterceptor;
}