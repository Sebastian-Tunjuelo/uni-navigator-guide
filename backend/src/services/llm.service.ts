import axios from 'axios';
import logger from '@/config/logger';
import { config } from '@/config/env';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMResult = {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  } | null;
  model: string;
};

export class LLMService {
  static isConfigured(): boolean {
    return Boolean(config.openai.apiKey || config.anthropic.apiKey);
  }

  static async generateChatCompletion(
    messages: ChatMessage[],
    temperature: number = 0.2
  ): Promise<LLMResult | null> {
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
  ): Promise<LLMResult | null> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { model: config.openai.chatModel, messages, temperature },
        { headers: { Authorization: `Bearer ${config.openai.apiKey}`, 'Content-Type': 'application/json' } }
      );
      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) { logger.warn('LLM: OpenAI returned empty content'); return null; }
      const usage = response.data?.usage;
      return {
        content: String(content),
        model: config.openai.chatModel,
        tokens: usage ? { prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens } : null,
      };
    } catch (err) {
      logger.error(`LLM: OpenAI request failed: ${err}`);
      return null;
    }
  }

  private static async generateWithAnthropic(
    messages: ChatMessage[],
    temperature: number
  ): Promise<LLMResult | null> {
    try {
      const system = messages.find((m) => m.role === 'system')?.content || '';
      const userMessages = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        { model: config.anthropic.chatModel, system, messages: userMessages, temperature, max_tokens: 800 },
        { headers: { 'x-api-key': config.anthropic.apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } }
      );
      const content = response.data?.content?.[0]?.text;
      if (!content) { logger.warn('LLM: Anthropic returned empty content'); return null; }
      const usage = response.data?.usage;
      return {
        content: String(content),
        model: config.anthropic.chatModel,
        tokens: usage ? { prompt: usage.input_tokens, completion: usage.output_tokens, total: usage.input_tokens + usage.output_tokens } : null,
      };
    } catch (err) {
      logger.error(`LLM: Anthropic request failed: ${err}`);
      return null;
    }
  }

  private static async generateWithGemini(
    messages: ChatMessage[],
    temperature: number
  ): Promise<LLMResult | null> {
    try {
      const system = messages.find((m) => m.role === 'system')?.content || '';
      const userMessages = messages.filter((m) => m.role !== 'system').map((m) => m.content).join('\n');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.chatModel}:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: `${system}\n\n${userMessages}` }] }],
          generationConfig: { temperature, maxOutputTokens: 800 },
        },
        { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': config.gemini.apiKey } }
      );
      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) { logger.warn('LLM: Gemini returned empty content'); return null; }
      const usage = response.data?.usageMetadata;
      return {
        content: String(content),
        model: config.gemini.chatModel,
        tokens: usage ? { prompt: usage.promptTokenCount ?? 0, completion: usage.candidatesTokenCount ?? 0, total: usage.totalTokenCount ?? 0 } : null,
      };
    } catch (err) {
      logger.error(`LLM: Gemini request failed: ${err}`);
      return null;
    }
  }
}
