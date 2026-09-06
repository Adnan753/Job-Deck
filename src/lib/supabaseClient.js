import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const looksLikePlaceholder = (value) => !value || value.includes('your-project') || value.includes('your-anon-public-key');

export const isSupabaseConfigured = !looksLikePlaceholder(supabaseUrl) && !looksLikePlaceholder(supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Missing or placeholder Supabase credentials. Fill in VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in .env.local from your Supabase project settings, ' +
    'then restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
