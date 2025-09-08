import { createClient } from '@supabase/supabase-js';
import { secrets } from './secrets';
import { NextResponse } from 'next/server';

export function getSupabase() {
  if (!secrets.supabaseUrl || !secrets.supabaseServiceKey) {
    throw new Error(
      'Missing Supabase envs. Have NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) set.'
    );
  }
  return createClient(secrets.supabaseUrl, secrets.supabaseServiceKey);
}

// Usage: call getSupabase() inside your handler, not at module scope

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = getSupabase();
  // ...your logic here...
  return NextResponse.json({ ok: true });
}
