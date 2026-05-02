import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Supabase
  supabase: {
    url: process.env.VITE_SUPABASE_URL || '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // RAG/LLM (optional)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    chatModel: process.env.ANTHROPIC_CHAT_MODEL || 'claude-3-5-sonnet-20240620',
  },
};

// Validate critical config
if (!config.supabase.url || !config.supabase.anonKey) {
  console.warn(
    'Warning: Supabase configuration missing. Some features may not work. Check .env.local'
  );
}
