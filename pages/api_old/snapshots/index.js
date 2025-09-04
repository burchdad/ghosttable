import { supabase } from '../../../lib/supabase'
import { createApi, zBody, AppError } from '../../../lib/api-tools'

export default createApi(
  { bodySchema: zBody({ base_id: z.string().uuid(), label: z.string().optional() }) },
  async ({ body }) => {
    const { data: snap, error: sErr } = await supabase.rpc('make_base_snapshot', { _base_id: body.base_id })
    if (sErr) throw sErr
    const { data, error } = await supabase.from('base_snapshots').insert([{ base_id: body.base_id, label: body.label || null, snapshot: snap }]).select()
    if (error) throw error
    return data[0]
  }
)
