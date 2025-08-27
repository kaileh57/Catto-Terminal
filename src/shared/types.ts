export interface ITerminalAPI {
  create: (id: string, shell?: string) => Promise<{success: boolean; error?: string}>;
  write: (id: string, data: string) => void;
  resize: (id: string, cols: number, rows: number) => void;
  onData: (id: string, callback: (data: string) => void) => (() => void) | void;
  onExit: (id: string, callback: () => void) => (() => void) | void;
}

export interface ShellProfile {
  id: string;
  name: string;
  command: string;
  args?: string[];
  icon?: string;
}

export interface IAppAPI {
  getVersion: () => Promise<string>;
}

export interface ICatAPI {
  ask: (prompt: string) => Promise<{success: boolean; error?: string}>;
  setModel: (model: string, options?: {provider?: string; routing?: string}) => Promise<{success: boolean; error?: string}>;
  setSystemPrompt: (preset: string, customPrompt?: string) => Promise<{success: boolean; error?: string}>;
  onToken: (callback: (token: string) => void) => (() => void);
  onComplete: (callback: (response: string) => void) => (() => void);
}

export interface IKeysAPI {
  store: (provider: string, key: string) => Promise<{success: boolean; error?: string}>;
  get: (provider: string) => Promise<{success: boolean; key?: string; error?: string}>;
  has: (provider: string) => Promise<{success: boolean; hasKey?: boolean; error?: string}>;
  remove: (provider: string) => Promise<{success: boolean; error?: string}>;
  list: () => Promise<{success: boolean; providers?: string[]; error?: string}>;
}

// Global type declarations
declare global {
  interface Window {
    terminal: ITerminalAPI;
    app: IAppAPI;
    cat: ICatAPI;
    keys: IKeysAPI;
  }
}
