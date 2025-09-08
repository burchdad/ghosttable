import { createClient } from '@supabase/supabase-js';
import { secrets } from './secrets';

export function getSupabase() {
  if (!secrets.supabaseUrl || !secrets.supabaseServiceKey) {
    throw new Error(
      'Missing Supabase envs. Have NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) set.'
    );
  }
  return createClient(secrets.supabaseUrl, secrets.supabaseServiceKey);
}

// Usage: call getSupabase() inside your handler, not at module scope
