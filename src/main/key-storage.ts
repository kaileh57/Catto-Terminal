import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class SimpleKeyStorage {
  private static CONFIG_DIR = path.join(os.homedir(), '.cat-terminal');
  private static KEY_FILE = path.join(SimpleKeyStorage.CONFIG_DIR, 'api-keys.json');

  private static ensureConfigDir(): void {
    if (!fs.existsSync(this.CONFIG_DIR)) {
      fs.mkdirSync(this.CONFIG_DIR, { recursive: true });
    }
  }

  static async storeAPIKey(provider: string, key: string): Promise<void> {
    try {
      this.ensureConfigDir();
      
      let keys: Record<string, string> = {};
      
      // Load existing keys if file exists
      if (fs.existsSync(this.KEY_FILE)) {
        const data = fs.readFileSync(this.KEY_FILE, 'utf8');
        keys = JSON.parse(data);
      }
      
      // Update with new key
      keys[provider] = key;
      
      // Save back to file
      fs.writeFileSync(this.KEY_FILE, JSON.stringify(keys, null, 2));
      
      console.log(`API key stored for ${provider}`);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw error;
    }
  }

  static async getAPIKey(provider: string): Promise<string | null> {
    try {
      if (!fs.existsSync(this.KEY_FILE)) {
        return null;
      }
      
      const data = fs.readFileSync(this.KEY_FILE, 'utf8');
      const keys: Record<string, string> = JSON.parse(data);
      
      return keys[provider] || null;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }

  static async hasAPIKey(provider: string): Promise<boolean> {
    const key = await this.getAPIKey(provider);
    return !!key;
  }

  static async removeAPIKey(provider: string): Promise<void> {
    try {
      if (!fs.existsSync(this.KEY_FILE)) {
        return;
      }
      
      const data = fs.readFileSync(this.KEY_FILE, 'utf8');
      const keys: Record<string, string> = JSON.parse(data);
      
      delete keys[provider];
      
      fs.writeFileSync(this.KEY_FILE, JSON.stringify(keys, null, 2));
      console.log(`API key removed for ${provider}`);
    } catch (error) {
      console.error('Failed to remove API key:', error);
      throw error;
    }
  }

  static async listProviders(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.KEY_FILE)) {
        return [];
      }
      
      const data = fs.readFileSync(this.KEY_FILE, 'utf8');
      const keys: Record<string, string> = JSON.parse(data);
      
      return Object.keys(keys);
    } catch (error) {
      console.error('Failed to list providers:', error);
      return [];
    }
  }
}