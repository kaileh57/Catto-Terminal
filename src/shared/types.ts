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
}

// Global type declarations
declare global {
  interface Window {
    terminal: ITerminalAPI;
    app: IAppAPI;
    cat: ICatAPI;
  }
}
