import { createClient } from '@supabase/supabase-js';

// Retrieve values from environment variables or local storage for in-app configuration overrides
const getStoredConfig = () => {
  const customUrl = localStorage.getItem('supabase_custom_url');
  const customAnonKey = localStorage.getItem('supabase_custom_anon_key');

  const url = (customUrl || (import.meta as any).env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (customAnonKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Determine if config is configured and not default placeholders
  const isConfigured = 
    !!url && 
    url !== 'https://your-supabase-project.supabase.co' && 
    !url.includes('your-supabase-project') &&
    !!anonKey && 
    anonKey !== 'your-supabase-anon-key' &&
    !anonKey.includes('your-supabase-anon-key');

  return {
    url,
    anonKey,
    isConfigured,
  };
};

export const currentConfig = getStoredConfig();

// Safe fallback credentials so createClient doesn't crash on boot if they are empty or placeholder
const targetUrl = currentConfig.isConfigured ? currentConfig.url : 'https://placeholder-project.supabase.co';
const targetKey = currentConfig.isConfigured ? currentConfig.anonKey : 'placeholder-anon-key-placeholder-anon-key-placeholder-anon-key';

// Create a single supabase client instance
export const supabase = createClient(targetUrl, targetKey);

// Wrapper to dynamically update Supabase credentials in-app
export function updateSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem('supabase_custom_url', url.trim());
  localStorage.setItem('supabase_custom_anon_key', anonKey.trim());

  // Reload page to apply new client configuration safely
  window.location.reload();
}

