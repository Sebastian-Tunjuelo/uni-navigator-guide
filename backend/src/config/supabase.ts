import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Test connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase connection warning:', error.message);
      return false;
    }
    console.log('✓ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}
