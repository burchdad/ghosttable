import { supabase } from '../../../lib/supabase'
import { createApi, zBody, AppError } from '../../../lib/api-tools'

export default createApi(
  { bodySchema: zBody({ record_id: z.string().uuid(), ttl: z.number().min(10).max(300).default(60), note: z.string().optional() }) },
  async ({ req, body }) => {
    const now = Date.now()
    const exp = new Date(now + (body.ttl * 1000)).toISOString()

    if (req.method === 'POST') { // acquire
      await supabase.rpc('cleanup_record_locks')
      // try insert; if exists but expired, replace
      const { data: existing } = await supabase.from('record_locks').select('*').eq('record_id', body.record_id).limit(1)
      if (existing?.[0] && new Date(existing[0].expires_at) > new Date()) {
        throw new AppError(409, 'locked', 'Record is locked')
      }
      const { error } = await supabase.from('record_locks')
        .upsert([{ record_id: body.record_id, user_id: null, note: body.note || null, expires_at: exp }], { onConflict: 'record_id' })
      if (error) throw error
      return { ok: true, until: exp }
    }

    if (req.method === 'PATCH') { // heartbeat extend
      const { error } = await supabase.from('record_locks')
        .update({ expires_at: exp })
        .eq('record_id', body.record_id)
      if (error) throw error
      return { ok: true, until: exp }
    }

    if (req.method === 'DELETE') { // release
      const { error } = await supabase.from('record_locks').delete().eq('record_id', body.record_id)
      if (error) throw error
      return { ok: true }
    }

    throw new AppError(405, 'method_not_allowed', `Method ${req.method} Not Allowed`)
  }
)
