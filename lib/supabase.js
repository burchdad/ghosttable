import { createClient } from '@supabase/supabase-js'
import { secrets } from './secrets'

export const supabase = createClient(
	secrets.supabaseUrl,
	secrets.supabaseServiceKey
)

console.log('SUPABASE KEY:', secrets.supabaseServiceKey?.slice(0, 10)) // should not be undefined
