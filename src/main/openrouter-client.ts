import { EventEmitter } from 'events';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenRouterClient extends EventEmitter {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  private defaultModel = 'anthropic/claude-3.5-haiku';

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async streamCompletion(
    messages: ChatMessage[], 
    options: OpenRouterOptions = {},
    onToken: (token: string) => void
  ): Promise<void> {
    const model = options.model || this.defaultModel;
    
    try {
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
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return;
            }

            try {
              const json = JSON.parse(data);
              const token = json.choices?.[0]?.delta?.content;
              if (token) {
                onToken(token);
              }
            } catch (e) {
              // Skip malformed JSON (comments, etc.)
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter streaming error:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch {
      return [];
    }
  }

  static createMockClient(): OpenRouterClient {
    const mock = new OpenRouterClient('mock-key');
    
    // Override streamCompletion for testing
    mock.streamCompletion = async (messages, options, onToken) => {
      const responses = [
        "Meow! I'm a helpful terminal cat. 🐱",
        "I can help you with coding, questions, or just chat!",
        "What would you like to know?",
        "Purr... *stretches paws*"
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate streaming by sending tokens with delay
      for (let i = 0; i < response.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        onToken(response[i]);
      }
    };
    
    return mock;
  }
}