# Cat Terminal - Remaining Implementation Plan

## 🎯 Current Status  
- **✅ PHASE 1 COMPLETE:** Basic Electron app with xterm.js terminal
- **✅ PHASE 2 COMPLETE:** Command interceptor system with `/` commands  
- **✅ PHASE 3 COMPLETE:** Real AI integration with OpenRouter
- **✅ PHASE 4 COMPLETE:** Advanced provider selection and routing
- **✅ PHASE 5 COMPLETE:** Copy/paste functionality with text selection
- **🔄 PHASE 6 IN PROGRESS:** Enhanced features and UX improvements

### 📝 Implementation Notes (2024-11-25)
- **node-pty issues on Windows:** Compilation errors with node-gyp, MSVC issues
- **Solution:** Implemented working terminal using Node.js `child_process` instead
- **Status:** Terminal creates real PowerShell processes, handles I/O
- **Current Issue:** Terminal appears blank - debugging output display

#### Debugging Steps Taken:
1. Added UTF-8 encoding setup for PowerShell
2. Added console logging for process stdout/stderr
3. Set stream encodings explicitly
4. Added initial terminal size (80x30)
5. PowerShell args: -NoLogo, -NoExit to ensure proper initialization
6. **Enabled DevTools** - Opens automatically on window load
7. **Added colored status messages** - "Initializing...", "Connected!" etc.
8. **Simplified PowerShell args** - Removed complex UTF-8 initialization
9. **Added initial newline** - Triggers PowerShell prompt after 500ms
10. **Fixed TypeScript types** - ITerminalAPI.create now returns result object
11. **Fixed duplicate app declaration** - Renamed to catTerminal to avoid conflicts
12. **Fixed module loading** - Changed from ES modules to CommonJS for renderer
13. **Fixed script path** - Updated HTML to load ./renderer/index.js
14. **Complete rewrite** - Created standalone app.js without module dependencies
15. **Bundled xterm locally** - Copied xterm.js and addon-fit.js to lib folder
16. **Fixed all loading issues** - No more exports/require errors in browser context
17. **Enhanced Cat Overlay** - Cat now on separate layer with better animations
18. **Improved Cat Art** - More expressive ASCII cat with multiple states
19. **Cat Positioning** - Cat positioned to watch command line from above
20. **BIG CAT** - Made cat much bigger and centered - this is CAT Terminal!
21. **Removed green glow** - Cat now has clean, simple appearance
22. **Command line at bottom** - Terminal properly positioned at bottom of screen
23. **Elegant cat design** - Replaced with sleek, beautiful ASCII cat (╱|、 style)
24. **Fixed terminal positioning** - Terminal limited to 15 rows at bottom (40% max height)
25. **Cat positioning** - Cat positioned at 40% from top, right side for better viewing
26. **ACTUALLY fixed terminal at bottom** - Terminal in fixed 200px container at absolute bottom
27. **Fixed cat encoding** - Replaced Japanese characters with standard ASCII art
28. **Cat positioned above terminal** - Cat sits 220px from bottom watching the terminal
29. **Terminal fills whole screen** - Terminal now takes full window height below title bar
30. **Clear command works** - Both 'clear' and 'cls' commands properly clear the terminal
31. **Better ASCII cat art** - Using beautiful cat art from the collection (Felix Lee's sleeping cat)
32. **Cat at bottom-right** - Cat positioned at bottom: 20px, right: 20px to watch typing
33. **Static ASCII cat** - Cat no longer animates or moves, just shows one clean frame per state
34. **Simple reliable ASCII** - Simplified all cat art to use basic ASCII characters that display properly
35. **Longer sleep delay** - Cat takes 2 minutes of inactivity before falling asleep (was 30 seconds)
36. **ASCII speech bubbles** - Text messages now use ASCII box drawing characters
37. **Hover transparency** - Cat overlay becomes 20% opaque when hovered, returns to 80% when not hovered
38. **Cat moved to bottom** - Cat repositioned from top-right to bottom-right to watch you type commands
39. **Angry cat state** - Added angry cat expression ( >.< ) with "Grr! Fix that!" message
40. **Error detection** - Cat detects PowerShell errors and gets angry (CommandNotFoundException, etc.)
41. **Enhanced reactions** - Cat stays angry for 8 seconds on errors vs 5 seconds for normal commands
42. **Fixed terminal rendering** - Fixed broken text wrapping and character positioning in xterm.js
43. **Improved terminal config** - Added proper line height, font settings, and debounced resize handling
44. **Better performance** - Reduced scrollback, disabled unnecessary features, fixed CSS conflicts
45. **Updated cat dialogue** - Made cat more sassy and judgy with user-requested messages
46. **Reduced dialogue frequency** - Typing messages now 0.5% chance, error messages 10% chance
47. **Enhanced error responses** - 8 variations including "Lock in!", "Really?", "Come on...", etc.
48. **PHASE 2 COMPLETE** - Command interceptor system fully implemented with `/` commands
49. **Fixed critical backspace bug** - Proper local command editing that doesn't crash PowerShell  
50. **Working command interception** - `/cat`, `/help`, `/toggle`, `/spawn`, `/ask` commands parsed correctly
51. **Clear command integration** - `clear` and `cls` commands now properly clear the terminal display
52. **Stable PowerShell integration** - No more process crashes from input handling

#### What You Should See Now:
1. **Full-screen terminal** - Terminal fills the entire window below the title bar
2. **Static ASCII cat** in bottom-right corner with clean, simple art:
   - Different expressions for different states (idle, typing, thinking, happy, surprised, love, sleeping, angry)
   - Cat never moves or animates - just changes expression
   - ASCII speech bubbles with box drawing characters when cat "talks"
   - Hover over cat to make it mostly transparent (20% opacity)
   - Gets angry ( >.< ) when PowerShell errors occur
3. **Cat behavior:**
   - Reacts to typing with alert expression
   - Falls asleep after 2 minutes of inactivity
   - Shows different emotions based on commands
4. **Clear command works** - Type 'clear' or 'cls' to clear the terminal screen
5. **Colored messages in terminal:**
   - Yellow: "Initializing Cat Terminal..."
   - Normal: "Creating PowerShell process..."
   - Green: "Connected!" 
6. **DevTools automatically open** for debugging
7. **Fully functional PowerShell** terminal with proper input/output

---

## 🚀 DELIVERY STRATEGY: WORKING PRODUCT FIRST

### 📦 **CURRENT PHASE 6: Enhanced Features & UX**
**Goal:** Add power-user features and improve the overall experience

#### ✅ **COMPLETED FEATURES:**
- **Advanced AI Model Switching** - Full provider/model selection with routing
- **Secure API Key Management** - Asterisk masking, Ctrl+V paste support
- **Real Streaming AI Chat** - OpenRouter integration with Claude 3.5 Haiku/Sonnet/GPT-4
- **Copy/Paste Functionality** - Text selection, Ctrl+C/Ctrl+V, right-click menu
- **Command Interception System** - All `/` commands working perfectly
- **Provider Routing** - :nitro (speed), :floor (price), specific provider selection
- **Working PowerShell Terminal** - Full integration with backspace/clear fixes

#### ✅ **COMPLETED: System Prompt Customization (2h)**
**Goal:** Allow users to customize the cat's personality and behavior ✅ COMPLETE

**What users have working:**
1. **✅ DONE:** Terminal with PowerShell integration  
2. **✅ DONE:** Cat overlay with reactions and animations
3. **✅ DONE:** `/cat` command with AI responses (real OpenRouter)
4. **✅ DONE:** `/toggle cat on|off|text` command 
5. **✅ DONE:** Real OpenRouter API key storage with `/setup` commands
6. **✅ DONE:** `/help` command with command list
7. **✅ DONE:** System prompt customization with 5 presets + custom + preview
8. **🔥 NEXT:** Command history with up/down arrow keys (3h)
9. **🔥 NEXT:** Fix arrow key cursor movement issues (1h)

**After Phase 2 is 100% complete, we can choose:**
- **Option A:** Polish & ship minimal viable product 
- **Option B:** Add agent system (`/spawn`, `/ask` commands)
- **Option C:** Add advanced features (autocomplete, tabs, etc.)

**FOCUS:** Deliver a working, shippable terminal with AI cat that users can actually use daily.

---

## 📋 Phase 1: Core Terminal Functionality (35-40h)
*Real shell integration and basic terminal features*

### 1.1 Install and Setup PTY Dependencies (4h) ✅ MODIFIED
```bash
# Original plan: npm install node-pty
# ACTUAL: Using child_process instead due to compilation issues
npm install @electron/rebuild --save-dev  # ✅ Done
# node-pty deferred until needed for advanced features
```

**Key Integration Points:**
- ~~node-pty requires native compilation~~ **ISSUE:** Compilation fails on Windows with node-gyp errors
- **SOLUTION:** Using Node.js built-in `child_process.spawn()` instead
- Works immediately without native dependencies
- Can add node-pty later if needed for advanced PTY features

### 1.2 Real PTY Integration (12h) ✅ COMPLETED (Alternative Implementation)
**Files created/modified:**
- ✅ `src/main/process-manager.ts` - Process management using child_process
- ✅ `src/main/shell-profiles.ts` - Shell detection integrated into process-manager
- ✅ `src/main/ipc.ts` - Updated with real process handlers

**Implementation Changes:**
- Used `child_process.spawn()` instead of node-pty
- PowerShell initialization with UTF-8 encoding
- Proper stdout/stderr handling
- Process lifecycle management (create, write, resize, kill)

**Implementation Details:**
```typescript
// src/main/pty-manager.ts
import * as pty from 'node-pty';
import * as os from 'os';

export class PtyManager {
  private processes = new Map<string, pty.IPty>();
  
  createPty(id: string, profile: ShellProfile): pty.IPty {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
      useConpty: true, // Use ConPTY on Windows
    });
    
    this.processes.set(id, ptyProcess);
    return ptyProcess;
  }
}
```

### 1.3 Shell Profile System (8h)
**Auto-detect available shells:**
- PowerShell: `pwsh.exe` (modern) → `powershell.exe` (legacy)
- WSL: Query `wsl.exe --list --quiet` for distros
- Default profiles + user-configurable profiles

```typescript
// src/main/shell-profiles.ts
export interface ShellProfile {
  id: string;
  name: string;
  command: string;
  args: string[];
  icon?: string;
  cwd?: string;
}

export class ShellDetector {
  static async detectProfiles(): Promise<ShellProfile[]> {
    const profiles: ShellProfile[] = [];
    
    // PowerShell detection
    if (await this.commandExists('pwsh')) {
      profiles.push({
        id: 'pwsh',
        name: 'PowerShell',
        command: 'pwsh',
        args: []
      });
    }
    
    // WSL detection
    const wslDistros = await this.getWSLDistros();
    wslDistros.forEach(distro => {
      profiles.push({
        id: `wsl-${distro}`,
        name: `WSL: ${distro}`,
        command: 'wsl.exe',
        args: ['-d', distro]
      });
    });
    
    return profiles;
  }
}
```

### 1.4 Tab Management System (8h)
**Files:**
- `src/renderer/tab-manager.ts` - Multi-tab terminal management
- Update `src/renderer/index.html` - Add tab strip UI
- Update `src/renderer/styles.css` - Tab styling

### 1.5 Configuration Foundation (4h)
**Create config system basics:**
- `src/shared/config.ts` - Config schema with zod validation
- Default config file creation in `%AppData%\CatTerminal\config.jsonc`

```typescript
// Basic config schema
const ConfigSchema = z.object({
  shell: z.object({
    defaultProfile: z.string().default('powershell'),
    profiles: z.array(ShellProfileSchema).default([])
  }),
  cat: z.object({
    mode: z.enum(['on', 'text', 'off']).default('on'),
    reactToTyping: z.boolean().default(true)
  }),
  models: z.object({
    default: z.string().default('anthropic/claude-3.5-sonnet'),
    aliases: z.record(z.string()).default({
      'claude': 'anthropic/claude-3.5-sonnet',
      'gemini': 'google/gemini-1.5-pro',
      'codex': 'openai/gpt-4-1106-preview'
    })
  })
});
```

---

## 🐱 Phase 2: Cat Overlay & Command System (35-40h)
*ASCII cat graphics and command interception*

### 2.1 ASCII Cat Overlay (10h)
**Files to create:**
- `src/renderer/cat-overlay.ts` - Cat rendering and animation
- `src/renderer/cat/` - ASCII art assets directory
- `assets/ascii/cat/classic/` - ASCII frames for different states

**Implementation approach:**
```typescript
// src/renderer/cat-overlay.ts
export class CatOverlay {
  private element: HTMLElement;
  private currentState: 'idle' | 'typing' | 'thinking' | 'error' = 'idle';
  private animationFrame: number = 0;
  
  constructor(container: HTMLElement) {
    this.element = this.createOverlayElement();
    container.appendChild(this.element);
    this.startAnimationLoop();
  }
  
  private createOverlayElement(): HTMLElement {
    const overlay = document.createElement('pre');
    overlay.className = 'cat-overlay';
    overlay.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 20px;
      z-index: 1000;
      pointer-events: none;
      font-family: monospace;
      color: #888;
      line-height: 1;
    `;
    return overlay;
  }
  
  setState(state: CatState, message?: string) {
    this.currentState = state;
    this.updateDisplay();
  }
}
```

### 2.2 Command Interceptor (6h)
**Intercept `/` commands before they reach the shell (Claude Code style):**
```typescript
// src/renderer/command-interceptor.ts
export class CommandInterceptor {
  private static COMMAND_PREFIX = '/';
  
  interceptCommand(input: string): CommandResult | null {
    if (!input.startsWith(this.COMMAND_PREFIX)) {
      return null; // Not a command, pass through
    }
    
    const commandLine = input.slice(1).trim();
    return this.parseCommand(commandLine);
  }
  
  private parseCommand(commandLine: string): CommandResult {
    const [command, ...args] = commandLine.split(' ');
    
    switch (command) {
      case 'cat':
        return { type: 'cat-ask', prompt: args.join(' ') };
      case 'spawn':
        return this.parseSpawnCommand(args);
      case 'toggle':
        return { type: 'toggle', target: args[0], value: args[1] };
      // ... other commands
    }
  }
}
```

### 2.3 OpenRouter Client Integration (8h)
**Files:**
- `src/main/openrouter-client.ts` - API client with streaming
- `src/main/key-storage.ts` - Secure API key management with keytar

**OpenRouter implementation:**
```typescript
// src/main/openrouter-client.ts
export class OpenRouterClient {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  
  async streamCompletion(
    model: string, 
    messages: ChatMessage[], 
    onToken: (token: string) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/hackclub/cat-terminal',
        'X-Title': 'Cat Terminal'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7
      })
    });
    
    // Handle SSE streaming
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content;
            if (token) onToken(token);
          } catch (e) {
            // Skip invalid JSON (comments)
          }
        }
      }
    }
  }
}
```

### 2.4 Basic Cat Chat Integration (4h)
**Connect cat overlay with OpenRouter:**
- `/cat <prompt>` → Stream response to cat bubble
- Cat state management (typing → thinking → replying)

### 2.5 Setup Command System (8h)
**Implement `/setup` command for configuring integrations:**

**Features:**
- **Install CLI tools**: Detect and install gemini-cli, Claude Code, anthropic CLI, etc.
- **Model selection**: Let user choose default model for the cat (Claude, Gemini, GPT-4, etc.)
- **API key management**: Input and store OpenRouter API key securely
- **Tool verification**: Test installed CLIs and API connections
- **Model capabilities**: Configure which models can run shell commands vs text-only
- **Provider setup**: Configure direct provider access (Anthropic, Google, OpenAI)

**Implementation approach:**
```typescript
// Extended command parser for /setup
case 'setup':
  return this.parseSetupCommand(args);

parseSetupCommand(args) {
  const subcommand = args[0];
  switch (subcommand) {
    case 'tools':
      return { type: 'setup-tools' }; // Install CLI tools
    case 'model':
      return { type: 'setup-model', model: args[1] }; // Set default model
    case 'key':
      return { type: 'setup-key', provider: args[1] }; // Configure API keys
    case 'test':
      return { type: 'setup-test' }; // Test all configurations
    default:
      return { type: 'setup-wizard' }; // Interactive setup wizard
  }
}
```

**Setup wizard features:**
- Interactive prompts for configuration
- Auto-detection of available tools and models
- Validation of API keys and connections
- Command execution permissions per model
- Backup/restore configuration settings

### 2.6 Key Storage with Keytar (4h)
```typescript
// src/main/key-storage.ts
import * as keytar from 'keytar';

export class KeyStorage {
  private static SERVICE_NAME = 'CatTerminal';
  
  static async storeAPIKey(provider: string, key: string): Promise<void> {
    try {
      await keytar.setPassword(this.SERVICE_NAME, provider, key);
    } catch (error) {
      // Fallback to .env file with warning
      console.warn('Failed to store in credential manager, falling back to .env');
      await this.storeInEnvFile(provider, key);
    }
  }
  
  static async getAPIKey(provider: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.SERVICE_NAME, provider);
    } catch (error) {
      return this.getFromEnvFile(provider);
    }
  }
}
```

### 2.7 Hotkeys and Shortcuts (3h)
- `Ctrl+K` - Quick cat ask dialog
- `Ctrl+T` - New terminal tab  
- `Ctrl+,` - Open config file

---

## 🤖 Phase 3: Agent System (30-35h)
*"Spawn cats" - named AI agents with capabilities*

### 3.1 Agent Management Core (10h)
**Files:**
- `src/main/agent-manager.ts` - Agent lifecycle management
- `src/shared/agent-types.ts` - Agent interfaces and types
- `src/main/providers/` - OpenRouter + CLI adapters

```typescript
// src/main/agent-manager.ts
export interface AgentSession {
  id: string;
  name: string;
  model: string;
  role: 'coder' | 'reviewer' | 'researcher';
  capabilities: Set<'read' | 'write' | 'exec'>;
  conversationHistory: ChatMessage[];
  createdAt: Date;
}

export class AgentManager {
  private sessions = new Map<string, AgentSession>();
  
  createAgent(options: CreateAgentOptions): AgentSession {
    const agent: AgentSession = {
      id: generateId(),
      name: options.name,
      model: this.resolveModelAlias(options.model),
      role: options.role || 'coder',
      capabilities: new Set(options.capabilities || ['read']),
      conversationHistory: [],
      createdAt: new Date()
    };
    
    this.sessions.set(agent.name, agent);
    return agent;
  }
  
  async askAgent(
    name: string, 
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const agent = this.sessions.get(name);
    if (!agent) throw new Error(`Agent ${name} not found`);
    
    // Add to conversation history
    agent.conversationHistory.push({ role: 'user', content: prompt });
    
    // Stream response
    await this.openRouterClient.streamCompletion(
      agent.model,
      agent.conversationHistory,
      (token) => {
        onToken(token);
        // Update agent's response in conversation history
      }
    );
  }
}
```

### 3.2 Side Drawer UI (8h)
**Create side panel for agent interactions:**
- `src/renderer/components/side-drawer.ts` - Sliding drawer component
- Agent list with status indicators
- Individual agent chat interfaces
- Conversation history per agent

### 3.3 Agent Commands Integration (8h)
**Implement agent-specific commands:**
```typescript
// Extended command parser
case 'spawn':
  return {
    type: 'spawn-agent',
    name: this.getFlag(args, '-n') || generateName(),
    model: this.getFlag(args, '-m') || 'claude',
    role: this.getFlag(args, '--role') || 'coder',
    capabilities: this.getFlag(args, '--caps')?.split(',') || ['read']
  };

case 'ask':
  const agentName = args[0]?.startsWith('@') ? args[0].slice(1) : null;
  return {
    type: 'ask-agent',
    agent: agentName,
    prompt: args.slice(1).join(' ')
  };
```

### 3.4 CLI Adapter Support (4h)
**Optional CLI adapters for direct provider access:**
```typescript
// src/main/providers/cli-adapter.ts
export class CLIAdapter {
  static async detectAvailable(): Promise<string[]> {
    const adapters = [];
    
    if (await this.commandExists('anthropic')) {
      adapters.push('anthropic');
    }
    if (await this.commandExists('gemini')) {
      adapters.push('gemini');
    }
    
    return adapters;
  }
  
  async streamCompletion(
    provider: string,
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const command = spawn(provider, ['--stream', prompt]);
    // Handle streaming output...
  }
}
```

---

## 🔧 Phase 4: Polish & Integration (10-15h)
*Testing, error handling, and final features*

### 4.1 Error Handling & Recovery (4h)
- Network error handling with retries
- Rate limiting detection and backoff
- Graceful degradation when services unavailable
- User-friendly error messages

### 4.2 Configuration Management (3h)
- Config validation with helpful error messages
- Runtime config updates (hot reload)
- Config migration system for future versions
- Settings UI (basic)

### 4.3 Testing & Bug Fixes (4h)
- Unit tests for command parser
- Integration tests for PTY management
- Cross-platform testing (Windows focus)
- Performance optimization

### 4.4 Packaging & Distribution (3h)
- Electron-builder configuration refinement  
- Code signing setup (if applicable)
- Auto-updater integration planning
- Installation/first-run experience

---

## 🚀 Implementation Priority Order

### Week 1: Get Real Terminal Working
1. **Day 1-2:** Install node-pty, setup PTY integration, basic shell spawning
2. **Day 3-4:** Shell profile detection, PowerShell + WSL support
3. **Day 5:** Tab management, basic configuration system

### Week 2: Add The Cat
1. **Day 1-2:** ASCII cat overlay, animation states
2. **Day 3-4:** Command interceptor, OpenRouter client
3. **Day 5:** Basic cat chat functionality, key storage

### Week 3: Agent System
1. **Day 1-2:** Agent management core, basic spawn/ask commands
2. **Day 3-4:** Side drawer UI, agent conversation history
3. **Day 5:** CLI adapters, advanced agent features

### Week 4: Polish & Ship
1. **Day 1-2:** Error handling, config management
2. **Day 3-4:** Testing, bug fixes, performance
3. **Day 5:** Packaging, documentation, release prep

---

## 🎯 Critical Success Factors

### Technical Risks & Mitigations
1. **node-pty Windows compilation issues**
   - *Mitigation:* Use prebuilt binaries, electron-rebuild, clear build instructions
   - *Fallback:* Mock terminal with warning for unsupported systems

2. **OpenRouter API reliability**
   - *Mitigation:* Retry logic, fallback providers, error handling
   - *Testing:* Use free models for development/testing

3. **Keytar credential storage**
   - *Mitigation:* .env fallback with user warnings
   - *Alternative:* Simple encrypted local storage

### Performance Considerations
- Keep cat overlay rendering under 1ms per frame
- Throttle API requests to respect rate limits
- Use ConPTY on Windows for better performance
- Lazy load agent UI components

### User Experience Priorities
1. **Terminal must feel responsive** - PTY integration is critical
2. **Cat should be delightful but not intrusive** - easy to disable
3. **Agents should be clearly separated** - avoid confusion
4. **Configuration should be intuitive** - good defaults, clear errors

---

## 📚 Key Dependencies & Versions

```json
{
  "dependencies": {
    "@xterm/xterm": "^5.5.0",
    "@xterm/addon-fit": "^0.10.0",
    "node-pty": "^1.0.0",
    "keytar": "^7.9.0",
    "zod": "^3.22.0",
    "marked": "^9.1.0"
  },
  "devDependencies": {
    "electron": "^37.3.1",
    "electron-rebuild": "^3.2.9"
  }
}
```

### Build Requirements
- **Windows:** Visual Studio Build Tools, Python 2.7+
- **Node/Electron:** Node 16+ (covered by Electron 37.3.1)
- **Native modules:** node-gyp, electron-rebuild for keytar/node-pty

---

## 🎯 Acceptance Criteria Checklist

**Phase 1 Complete When:**
- [x] Can open PowerShell tab with real shell ✅
- [ ] Can open WSL tab if WSL available (deferred)
- [ ] Multiple tabs work correctly (single tab working)
- [x] Terminal responds to typing, commands execute ✅
- [ ] Config file loads/saves correctly (deferred)
- [x] ASCII cat overlay working ✅
- [x] Cat reacts to commands and errors ✅
- [x] Terminal rendering fixed ✅

**PHASE 1 STATUS: 🎉 CORE FUNCTIONALITY COMPLETE**

**Phase 2 Complete When:**
- [x] ASCII cat appears in bottom-right ✅
- [x] `/` command interceptor system working ✅
- [x] All command parsing implemented ✅ (`/cat`, `/help`, `/toggle`, `/spawn`, `/ask`)
- [x] Cat shows appropriate animations ✅ (static expressions)
- [x] Command interception doesn't break terminal ✅
- [x] Backspace and clear commands work properly ✅
- [ ] `/cat "question"` streams AI response (needs OpenRouter integration)
- [ ] `/toggle cat off/on/text` works (needs implementation)
- [ ] API keys stored securely (needs OpenRouter setup)

**🎉 PHASE 2 STATUS: AI INTEGRATION COMPLETE**

**What's Working Now:**
- ✅ `/cat "question"` → Real AI responses with mock OpenRouter client
- ✅ Streaming responses appear in cat speech bubble in real-time
- ✅ All command parsing and interception works perfectly
- ✅ Terminal, backspace, clear commands all stable
- ✅ Cat reacts with proper emotions and animations

**Phase 2 Complete Tasks:**
- [x] `/cat "question"` streams AI response ✅ (using mock client)
- [x] Command interceptor system working ✅ 
- [x] All command parsing implemented ✅ (`/cat`, `/help`, `/toggle`, `/spawn`, `/ask`)
- [x] Cat shows appropriate animations ✅ (static expressions)
- [x] Command interception doesn't break terminal ✅
- [x] Backspace and clear commands work properly ✅
- [ ] `/toggle cat off/on/text` works (needs implementation)
- [ ] Real OpenRouter API keys stored securely (needs key storage)

**Phase 3 Complete When:**
- [ ] `/spawn -n name -m claude` creates agent
- [ ] `/ask @name "question"` streams to side drawer
- [ ] Agent list shows active agents
- [ ] Multiple agents work independently
- [ ] Conversation history preserved per agent

**Final Release When:**
- [ ] All commands in design spec work
- [ ] Error handling prevents crashes
- [ ] Packaging produces working installer
- [ ] Documentation complete
- [ ] Performance meets standards (< 100ms command response)

---

## 🎨 Phase 5: Advanced UI Features (15-20h)
*Visual enhancements and user experience improvements*

### 5.1 Claude Code Style Command Autocomplete (12h)
**Implement visual autocomplete system for `/` commands:**

**Files to create:**
- `src/renderer/autocomplete.js` - Autocomplete UI component and logic
- `src/renderer/autocomplete.css` - Styling for autocomplete dropdown
- Integration with existing terminal input handling

**Features:**
- **Trigger on `/`**: Show autocomplete dropdown when user types `/`
- **Command suggestions**: List available commands (`cat`, `spawn`, `ask`, `toggle`, etc.)
- **Fuzzy matching**: Filter commands as user continues typing
- **Visual design**: Match Claude Code's clean, dark autocomplete UI
- **Keyboard navigation**: Arrow keys to navigate, Tab/Enter to complete, Esc to dismiss
- **Help text**: Show brief description for each command
- **Parameter hints**: Show expected parameters after selecting command

**Implementation approach:**
```typescript
// src/renderer/autocomplete.js
export class CommandAutocomplete {
  private commands = [
    { name: 'cat', description: 'Ask the cat a question', usage: '/cat <question>' },
    { name: 'spawn', description: 'Create a new AI agent', usage: '/spawn -n <name> -m <model>' },
    { name: 'ask', description: 'Ask an agent a question', usage: '/ask @<agent> <question>' },
    { name: 'toggle', description: 'Toggle cat visibility', usage: '/toggle cat on/off/text' }
  ];
  
  private dropdown: HTMLElement;
  private isVisible: boolean = false;
  private selectedIndex: number = 0;
  private filteredCommands: Command[] = [];
  
  constructor(terminalElement: HTMLElement) {
    this.createDropdown();
    this.attachToTerminal(terminalElement);
  }
  
  show(inputText: string, cursorPosition: { x: number, y: number }) {
    const query = inputText.slice(1); // Remove '/' prefix
    this.filteredCommands = this.filterCommands(query);
    
    if (this.filteredCommands.length > 0) {
      this.renderDropdown();
      this.positionDropdown(cursorPosition);
      this.isVisible = true;
    }
  }
  
  private filterCommands(query: string): Command[] {
    if (!query) return this.commands;
    
    return this.commands.filter(cmd =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  private renderDropdown() {
    this.dropdown.innerHTML = this.filteredCommands.map((cmd, index) => `
      <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}" 
           data-index="${index}">
        <div class="command-name">/${cmd.name}</div>
        <div class="command-description">${cmd.description}</div>
        <div class="command-usage">${cmd.usage}</div>
      </div>
    `).join('');
  }
  
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.isVisible) return false;
    
    switch (event.key) {
      case 'ArrowDown':
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
        this.renderDropdown();
        return true;
      case 'ArrowUp':
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderDropdown();
        return true;
      case 'Tab':
      case 'Enter':
        return this.completeCommand();
      case 'Escape':
        this.hide();
        return true;
      default:
        return false;
    }
  }
  
  private completeCommand(): boolean {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredCommands.length) {
      const command = this.filteredCommands[this.selectedIndex];
      // Emit completion event with command name
      this.onComplete(command.name);
      this.hide();
      return true;
    }
    return false;
  }
}
```

**Visual Design (Claude Code inspired):**
```css
/* src/renderer/autocomplete.css */
.command-autocomplete {
  position: absolute;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  font-family: 'Cascadia Code', monospace;
  font-size: 13px;
}

.autocomplete-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #404040;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item.selected {
  background: #404040;
}

.autocomplete-item:hover {
  background: #404040;
}

.command-name {
  color: #4fc3f7;
  font-weight: 600;
  margin-bottom: 2px;
}

.command-description {
  color: #cccccc;
  font-size: 12px;
  margin-bottom: 2px;
}

.command-usage {
  color: #888888;
  font-size: 11px;
  font-style: italic;
}
```

### 5.2 Parameter Hints and Inline Help (4h)
**After command completion, show parameter hints:**
- Show expected parameters in gray text
- Tab completion for common parameters
- Inline validation feedback

### ✅ 5.3 Copy/Paste Functionality (2h) **COMPLETED** 
**Essential terminal features - NOW WORKING:**
- **✅ Ctrl+C** copy selected text to system clipboard  
- **✅ Ctrl+V** paste from clipboard (works in prompts and main terminal!)
- **✅ Text selection** enabled with right-click and drag selection
- **✅ Selection support** in xterm.js for copying text
- **✅ Clipboard integration** with system clipboard via navigator.clipboard
- **✅ API key input** now works with Ctrl+V paste operations

### 5.4 Command History Navigation (3h) **🔥 HIGH PRIORITY**  
**Essential terminal UX features:**
- **Up/Down arrow keys** navigate through command history
- **Ctrl+R** reverse search through history  
- **Prevent cursor going below current line**
- History persistence across sessions
- PowerShell-style history integration
- Separate history for `/` commands vs regular shell commands

### ✅ 5.5 Customizable Cat System Prompt (2h) **COMPLETED** 
**Allow users to customize the cat's personality and behavior - ✅ DONE:**
- **✅ `/setup prompt` command** to configure custom system prompt
- **✅ Preset personalities** (professional, casual, developer, playful, default)
- **✅ `/setup prompt preview <preset>`** functionality for testing presets
- **✅ Custom prompt input** with fallback to default if empty
- **✅ Complete backend IPC implementation** with preset templates
- **✅ Cat overlay integration** with personality-specific reactions

### 5.6 Terminal Context Integration (3h) **NEW FEATURE**  
**Feed terminal session context to AI for better responses:**
- **Terminal history capture** - Last N commands and outputs
- **Working directory awareness** - Include current path and file listings
- **Error context** - Include recent errors and stack traces in AI requests
- **Smart context filtering** - Remove sensitive info, focus on relevant data
- **Context size management** - Truncate/summarize long outputs for token efficiency
- **Toggle context sharing** - User control over privacy

### 5.7 Markdown Rendering Toggle (2h) **NEW FEATURE**
**Enhanced AI response display with optional markdown formatting:**
- **`/toggle markdown on|off`** command to enable/disable markdown rendering
- **Code block highlighting** with syntax highlighting for popular languages  
- **Table rendering** for structured data responses
- **Link formatting** (clickable URLs when possible)
- **Bold/italic/strikethrough** text formatting support
- **Fallback to plain text** when markdown is disabled
- **Smart detection** - Auto-enable markdown for code-heavy responses

**Implementation approach:**
```typescript
// Command history management
class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private originalCommand: string = '';
  
  add(command: string) {
    if (command.trim() && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
      this.currentIndex = this.history.length;
    }
  }
  
  navigateUp(): string | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  navigateDown(): string | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else if (this.currentIndex === this.history.length - 1) {
      this.currentIndex++;
      return this.originalCommand; // Return to what user was typing
    }
    return null;
  }
}
```

### 5.4 Command Favorites and Analytics (4h)  
**Enhanced command experience:**
- Recently used commands appear at top
- Favorite/pin frequently used commands
- Command usage analytics for better suggestions

---

*Total Estimated Effort: ~125-150 hours*  
*Target Timeline: 5 weeks with 1-2 developers*  
*Critical Path: PTY Integration → Cat Overlay → Agent System → Polish → Autocomplete*