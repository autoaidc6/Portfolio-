import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Use placeholder values to prevent the Supabase client from throwing an error on initialization
// if environment variables are not yet set.
const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if the Supabase environment variables are actually provided.
 * Returns false if placeholders are being used.
 */
export const isSupabaseConfigured = () => {
  return !!rawUrl && !!rawKey && rawUrl !== 'https://placeholder-project.supabase.co';
};