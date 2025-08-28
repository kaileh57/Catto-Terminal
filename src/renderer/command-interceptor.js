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
      case 'setup':
        return this.parseSetupCommand(args);
      case 'model':
        return this.parseModelCommand(args);
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
        message: 'Toggle command requires target and value. Usage: /toggle cat on|off|text or /toggle markdown on|off'
      };
    }

    const [target, value] = args;
    
    if (target === 'cat') {
      if (!['on', 'off', 'text'].includes(value.toLowerCase())) {
        return {
          type: 'error',
          message: 'Invalid cat toggle value. Use: on, off, or text'
        };
      }

      return {
        type: 'toggle',
        target: 'cat',
        value: value.toLowerCase()
      };
    } else if (target === 'markdown') {
      if (!['on', 'off'].includes(value.toLowerCase())) {
        return {
          type: 'error',
          message: 'Invalid markdown toggle value. Use: on or off'
        };
      }

      return {
        type: 'toggle',
        target: 'markdown',
        value: value.toLowerCase()
      };
    } else {
      return {
        type: 'error',
        message: 'Invalid toggle target. Use: cat or markdown'
      };
    }
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
   * Parse /setup command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseSetupCommand(args) {
    if (args.length === 0) {
      return {
        type: 'setup-help',
        message: 'Available setup commands:\\n  /setup key openrouter - Set OpenRouter API key\\n  /setup prompt [preset] - Configure system prompt\\n  /setup status - Check configuration status'
      };
    }

    const [subcommand, ...subArgs] = args;

    switch (subcommand.toLowerCase()) {
      case 'key':
        if (subArgs.length === 0 || subArgs[0] !== 'openrouter') {
          return {
            type: 'error',
            message: 'Usage: /setup key openrouter'
          };
        }
        return {
          type: 'setup-key',
          provider: 'openrouter'
        };
      case 'prompt':
        return this.parsePromptSetupCommand(subArgs);
      case 'status':
        return {
          type: 'setup-status'
        };
      default:
        return {
          type: 'error',
          message: `Unknown setup command: ${subcommand}. Try /setup for help.`
        };
    }
  }

  /**
   * Parse /setup prompt command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parsePromptSetupCommand(args) {
    if (args.length === 0) {
      return {
        type: 'prompt-help',
        message: 'System Prompt Configuration:\\n\\n' +
          'Available presets:\\n' +
          '  professional - Formal, business-oriented assistant\\n' +
          '  casual - Friendly, relaxed conversation style\\n' +
          '  developer - Code-focused with technical expertise\\n' +
          '  playful - Fun and creative with cat personality\\n' +
          '  custom - Set your own custom prompt\\n' +
          '  default - Reset to original cat assistant\\n' +
          '  preview <preset> - Preview what a preset will do\\n\\n' +
          'Usage:\\n' +
          '  /setup prompt professional\\n' +
          '  /setup prompt preview developer\\n' +
          '  /setup prompt custom\\n' +
          '  /setup prompt default'
      };
    }

    const preset = args[0].toLowerCase();
    const validPresets = ['professional', 'casual', 'developer', 'playful', 'custom', 'default', 'preview'];

    // Handle preview command
    if (preset === 'preview') {
      const previewPreset = args[1]?.toLowerCase() || '';
      const validPreviewPresets = ['professional', 'casual', 'developer', 'playful', 'default'];
      
      if (!previewPreset || !validPreviewPresets.includes(previewPreset)) {
        return {
          type: 'error',
          message: `Preview requires a valid preset. Usage: /setup prompt preview <preset>`
        };
      }
      
      return {
        type: 'prompt-preview',
        preset: previewPreset
      };
    }

    if (!['professional', 'casual', 'developer', 'playful', 'custom', 'default'].includes(preset)) {
      return {
        type: 'error',
        message: `Invalid preset: ${preset}. Valid presets: professional, casual, developer, playful, custom, default, preview`
      };
    }

    return {
      type: 'prompt-set',
      preset: preset
    };
  }

  /**
   * Parse /model command
   * @param {string[]} args 
   * @returns {CommandResult}
   */
  parseModelCommand(args) {
    if (args.length === 0) {
      return {
        type: 'model-list',
        message: 'Available models:\\n' +
          '  Anthropic Models:\\n' +
          '    haiku, claude-3.5-haiku, anthropic/claude-3.5-haiku - Fast and efficient (default)\\n' +
          '    sonnet, claude-3.5-sonnet, anthropic/claude-3.5-sonnet - Powerful but slower\\n' +
          '  OpenAI Models:\\n' +
          '    gpt-4, openai/gpt-4, openai/gpt-4o - GPT-4 variants\\n' +
          '  Meta Models:\\n' +
          '    llama-3.1-70b, meta-llama/llama-3.1-70b-instruct\\n' +
          '    llama-3.3-70b, meta-llama/llama-3.3-70b-instruct\\n' +
          '  DeepSeek Models:\\n' +
          '    deepseek-r1, deepseek/deepseek-r1\\n' +
          '  Provider Options:\\n' +
          '    :nitro - Prioritize speed (e.g. llama-3.1-70b:nitro)\\n' +
          '    :floor - Prioritize lowest price (e.g. gpt-4:floor)\\n' +
          '\\nUsage: /model <model-name> [provider] [options]\\n' +
          'Examples:\\n' +
          '  /model haiku\\n' +
          '  /model anthropic/claude-3.5-sonnet\\n' +
          '  /model gpt-4 openai\\n' +
          '  /model llama-3.1-70b:nitro together'
      };
    }

    const fullInput = args.join(' ');
    let model = args[0].toLowerCase();
    let provider = args[1] ? args[1].toLowerCase() : null;
    let routing = null;

    // Handle model:routing shortcuts (e.g., llama-3.1-70b:nitro)
    if (model.includes(':')) {
      const [modelPart, routingPart] = model.split(':');
      model = modelPart;
      routing = routingPart;
    }

    // Normalize common model shortcuts
    const modelMappings = {
      'haiku': 'anthropic/claude-3.5-haiku',
      'sonnet': 'anthropic/claude-3.5-sonnet',
      'claude-3.5-haiku': 'anthropic/claude-3.5-haiku',
      'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'gpt-4': 'openai/gpt-4',
      'gpt-4o': 'openai/gpt-4o',
      'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
      'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
      'deepseek-r1': 'deepseek/deepseek-r1'
    };

    // Apply model mapping if it exists
    let normalizedModel = modelMappings[model] || model;

    // If model already has provider format, use as-is
    if (!normalizedModel.includes('/') && provider) {
      // User specified provider separately
      normalizedModel = `${provider}/${model}`;
    }

    // Validate the model format
    if (!normalizedModel.includes('/')) {
      return {
        type: 'error',
        message: `Invalid model format: ${model}. Use provider/model format or a known shortcut. Use /model to see examples.`
      };
    }

    return {
      type: 'model-set',
      model: normalizedModel,
      provider: provider,
      routing: routing
    };
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
      toggle: '/toggle cat on|off|text or /toggle markdown on|off - Toggle features',
      setup: '/setup key|prompt|status - Configure API keys, system prompts, and settings',
      model: '/model [name] - Switch AI model (haiku, sonnet, gpt-4) or list available models',
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