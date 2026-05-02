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
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    chatModel: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
  },
};

// Validate critical config
if (!config.supabase.url || !config.supabase.anonKey) {
  console.warn(
    'Warning: Supabase configuration missing. Some features may not work. Check .env.local'
  );
}
