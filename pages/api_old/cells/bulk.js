import { createApi, zBody, AppError } from '../../../lib/api-tools'
import { supabase } from '../../../lib/supabase'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

const item = z.object({
  record_id: z.string().uuid(),
  field_id: z.string().uuid(),
  value: z.any(),
  record_version: z.number().int().optional()
})
export default createApi(
  { bodySchema: zBody({ updates: z.array(item).min(1) }), rateLimit: { limit: 120, window: 60 } },
  async ({ body }) => {
    const updates = body.updates

    // optional version check (light OCC): ensure all targeted records keep their version
    const needCheck = updates.some(u => typeof u.record_version === 'number')
    if (needCheck) {
      const ids = Array.from(new Set(updates.filter(u=>u.record_version!=null).map(u => u.record_id)))
      const { data: recs, error } = await supabase.from('records').select('id, version').in('id', ids)
      if (error) throw error
      const map = new Map(recs.map(r => [r.id, r.version]))
      for (const u of updates) {
        if (u.record_version == null) continue
        if (map.get(u.record_id) !== u.record_version) {
          throw new AppError(409, 'conflict', `Record ${u.record_id} version mismatch`)
        }
      }
    }

    // single upsert call (db-side validation/trigger will run)
    const { data, error } = await supabase
      .from('record_values')
      .upsert(
        updates.map(u => ({ record_id: u.record_id, field_id: u.field_id, value: u.value })),
        { onConflict: 'record_id,field_id' }
      )
      .select()
    if (error) throw error
    return { updated: data.length }
  }
)
