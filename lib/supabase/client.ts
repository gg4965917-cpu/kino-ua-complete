import { createBrowserClient, SupabaseClient } from '@supabase/ssr'

let supabaseInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Return null if Supabase is not configured
  if (!url || !key) {
    return null;
  }
  
  // Reuse existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  supabaseInstance = createBrowserClient(url, key);
  return supabaseInstance;
}
