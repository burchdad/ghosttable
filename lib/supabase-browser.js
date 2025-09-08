import { createClient } from '@supabase/supabase-js';
import { secrets } from './secrets';

export const supabaseBrowser = createClient(
  secrets.supabaseUrl,
  secrets.supabaseAnonKey
);
