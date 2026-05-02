import axios from 'axios';
import logger from '@/config/logger';
import { config } from '@/config/env';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export class LLMService {
  static isConfigured(): boolean {
    return Boolean(config.openai.apiKey || config.anthropic.apiKey);
  }

  static async generateChatCompletion(
    messages: ChatMessage[],
    temperature: number = 0.2
  ): Promise<string | null> {
    if (config.gemini.apiKey) {
      return this.generateWithGemini(messages, temperature);
    }

    if (config.openai.apiKey) {
      return this.generateWithOpenAI(messages, temperature);
    }

    if (config.anthropic.apiKey) {
      return this.generateWithAnthropic(messages, temperature);
    }

    logger.warn('LLM: No API key configured');
    return null;
  }

  private static async generateWithOpenAI(
    messages: ChatMessage[],
    temperature: number
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: config.openai.chatModel,
          messages,
          temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        logger.warn('LLM: OpenAI returned empty content');
        return null;
      }

      return String(content);
    } catch (err) {
      logger.error(`LLM: OpenAI request failed: ${err}`);
      return null;
    }
  }

  private static async generateWithAnthropic(
    messages: ChatMessage[],
    temperature: number
  ): Promise<string | null> {
    try {
      const system = messages.find((m) => m.role === 'system')?.content || '';
      const userMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: config.anthropic.chatModel,
          system,
          messages: userMessages,
          temperature,
          max_tokens: 800,
        },
        {
          headers: {
            'x-api-key': config.anthropic.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data?.content?.[0]?.text;
      if (!content) {
        logger.warn('LLM: Anthropic returned empty content');
        return null;
      }

      return String(content);
    } catch (err) {
      logger.error(`LLM: Anthropic request failed: ${err}`);
      return null;
    }
  }

  private static async generateWithGemini(
    messages: ChatMessage[],
    temperature: number
  ): Promise<string | null> {
    try {
      const system = messages.find((m) => m.role === 'system')?.content || '';
      const userMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => m.content)
        .join('\n');

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.chatModel}:generateContent`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${system}\n\n${userMessages}` }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 800,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': config.gemini.apiKey,
          },
        }
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        logger.warn('LLM: Gemini returned empty content');
        return null;
      }

      return String(content);
    } catch (err) {
      logger.error(`LLM: Gemini request failed: ${err}`);
      return null;
    }
  }
}
