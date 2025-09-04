import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end() }
  const { activity_id } = req.body || {}
  if (!activity_id) return res.status(400).json({ error: 'activity_id required' })

  const { data: acts, error: aErr } = await supabase.from('record_activity').select('*').eq('id', activity_id).limit(1)
  if (aErr) return res.status(500).json({ error: aErr.message })
  const act = acts?.[0]
  if (!act) return res.status(404).json({ error: 'not found' })

  if (act.action === 'insert') {
    const { error } = await supabase
      .from('record_values')
      .delete()
      .eq('record_id', act.record_id)
      .eq('field_id', act.field_id)
    if (error) return res.status(500).json({ error: error.message })
  } else if (act.action === 'delete') {
    const { error } = await supabase
      .from('record_values')
      .upsert([{
        record_id: act.record_id,
        field_id: act.field_id,
        value: act.old_value,
        table_id: act.table_id
      }], { onConflict: 'record_id,field_id' })
    if (error) return res.status(500).json({ error: error.message })
  } else {
    const { error } = await supabase
      .from('record_values')
      .update({ value: act.old_value })
      .eq('record_id', act.record_id)
      .eq('field_id', act.field_id)
    if (error) return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ ok: true })
}

export default withSentry(handler);
