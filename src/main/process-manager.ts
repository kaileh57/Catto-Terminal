import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as path from 'path';

export interface ProcessOptions {
  shell?: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  cols?: number;
  rows?: number;
}

export interface ShellProfile {
  id: string;
  name: string;
  command: string;
  args: string[];
  icon?: string;
  cwd?: string;
}

export class ProcessManager extends EventEmitter {
  private processes = new Map<string, ChildProcessWithoutNullStreams>();
  private buffers = new Map<string, string>();

  createProcess(id: string, options: ProcessOptions = {}): ChildProcessWithoutNullStreams {
    // Determine the shell to use
    const shell = options.shell || this.getDefaultShell();
    let args = options.args || [];
    
    // Set up environment
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ...options.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    };

    // Handle columns and rows for Windows
    if (os.platform() === 'win32' && options.cols && options.rows) {
      env.COLUMNS = options.cols.toString();
      env.LINES = options.rows.toString();
    }

    // Add PowerShell-specific arguments for better terminal behavior
    if (os.platform() === 'win32' && shell.includes('powershell')) {
      // Use -NoLogo and ensure prompt shows current directory
      args = ['-NoLogo', '-NoExit'];
    }

    console.log(`Creating process ${id} with shell: ${shell}`, args);

    // Spawn the process
    const proc = spawn(shell, args, {
      cwd: options.cwd || process.env.USERPROFILE || process.env.HOME || process.cwd(),
      env,
      shell: false,
      windowsHide: true,
    });

    // Store the process
    this.processes.set(id, proc);
    this.buffers.set(id, '');

    // Set encoding for streams
    if (proc.stdout) proc.stdout.setEncoding('utf8');
    if (proc.stderr) proc.stderr.setEncoding('utf8');
    if (proc.stdin) proc.stdin.setDefaultEncoding('utf8');
    
    // Don't clear screen to preserve terminal positioning

    // Handle stdout
    proc.stdout.on('data', (data: string) => {
      console.log(`Process ${id} stdout:`, data);
      const text = this.processOutput(Buffer.from(data));
      this.buffers.set(id, this.buffers.get(id)! + text);
      this.emit('data', id, text);
    });

    // Handle stderr
    proc.stderr.on('data', (data: string) => {
      console.log(`Process ${id} stderr:`, data);
      const text = this.processOutput(Buffer.from(data));
      this.buffers.set(id, this.buffers.get(id)! + text);
      this.emit('data', id, text);
    });

    // Handle process exit
    proc.on('exit', (code, signal) => {
      this.emit('exit', id, code, signal);
      this.processes.delete(id);
      this.buffers.delete(id);
    });

    // Handle errors
    proc.on('error', (error) => {
      this.emit('error', id, error);
    });

    return proc;
  }

  writeToProcess(id: string, data: string): void {
    const proc = this.processes.get(id);
    if (proc && proc.stdin && !proc.stdin.destroyed) {
      console.log(`Writing to process ${id}:`, JSON.stringify(data));
      proc.stdin.write(data);
    } else {
      console.warn(`Cannot write to process ${id} - stdin unavailable`);
    }
  }

  resizeProcess(id: string, cols: number, rows: number): void {
    const proc = this.processes.get(id);
    if (!proc) return;

    // On Windows, we can try to send a resize sequence
    if (os.platform() === 'win32') {
      // This is a workaround - full resize support requires node-pty
      // For now, we'll just track the size for new processes
      this.emit('resize', id, cols, rows);
    }
  }

  killProcess(id: string): void {
    const proc = this.processes.get(id);
    if (proc) {
      // Try graceful shutdown first
      if (os.platform() === 'win32') {
        proc.kill('SIGTERM');
      } else {
        proc.kill('SIGTERM');
      }
      
      // Force kill after timeout
      setTimeout(() => {
        if (this.processes.has(id)) {
          proc.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  getProcess(id: string): ChildProcessWithoutNullStreams | undefined {
    return this.processes.get(id);
  }

  getAllProcesses(): string[] {
    return Array.from(this.processes.keys());
  }

  private getDefaultShell(): string {
    if (os.platform() === 'win32') {
      // Try PowerShell Core first, then Windows PowerShell
      const pwsh = process.env.PROGRAMFILES + '\\PowerShell\\7\\pwsh.exe';
      const powershell = process.env.SYSTEMROOT + '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
      
      // For now, default to PowerShell (we'll add detection later)
      return powershell;
    } else if (os.platform() === 'darwin') {
      return process.env.SHELL || '/bin/zsh';
    } else {
      return process.env.SHELL || '/bin/bash';
    }
  }

  private processOutput(data: Buffer): string {
    // Handle different encodings and clean up output
    let text = data.toString('utf8');
    
    // Remove null bytes that sometimes appear
    text = text.replace(/\0/g, '');
    
    // Handle carriage returns for Windows
    if (os.platform() === 'win32') {
      // Convert Windows line endings
      text = text.replace(/\r\n/g, '\n');
    }
    
    return text;
  }

  // Shell detection methods
  static async detectShellProfiles(): Promise<ShellProfile[]> {
    const profiles: ShellProfile[] = [];
    const platform = os.platform();

    if (platform === 'win32') {
      // PowerShell detection
      const powershellPath = process.env.SYSTEMROOT + '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
      profiles.push({
        id: 'powershell',
        name: 'PowerShell',
        command: powershellPath,
        args: ['-NoLogo']
      });

      // Command Prompt
      profiles.push({
        id: 'cmd',
        name: 'Command Prompt',
        command: 'cmd.exe',
        args: []
      });

      // PowerShell Core detection
      const pwshPath = process.env.PROGRAMFILES + '\\PowerShell\\7\\pwsh.exe';
      const fs = await import('fs');
      if (fs.existsSync(pwshPath)) {
        profiles.push({
          id: 'pwsh',
          name: 'PowerShell Core',
          command: pwshPath,
          args: ['-NoLogo']
        });
      }

      // WSL detection (we'll add this later)
      // For now, just return Windows shells
    } else if (platform === 'darwin') {
      profiles.push({
        id: 'zsh',
        name: 'zsh',
        command: '/bin/zsh',
        args: []
      });
      profiles.push({
        id: 'bash',
        name: 'bash',
        command: '/bin/bash',
        args: []
      });
    } else {
      // Linux
      profiles.push({
        id: 'bash',
        name: 'bash',
        command: '/bin/bash',
        args: []
      });
      profiles.push({
        id: 'sh',
        name: 'sh',
        command: '/bin/sh',
        args: []
      });
    }

    return profiles;
  }
}
