import { supabase } from '../../../lib/supabase'
import { createApi, AppError } from '../../../lib/api-tools'

export default createApi({}, async ({ req }) => {
  if (req.method === 'DELETE') {
    const { id } = req.query
    const { error } = await supabase.from('api_keys').delete().eq('id', id)
    if (error) throw error
    return { ok: true }
  }
  throw new AppError(405, 'method_not_allowed', `Method ${req.method} Not Allowed`)
})
