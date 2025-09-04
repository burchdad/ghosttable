import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end() }

  const { record_id, field_id, path } = req.body || {}
  if (!record_id || !field_id || !path) return res.status(400).json({ error: 'record_id, field_id, path required' })

  // 1) remove from storage
  const { error: rmErr } = await supabase.storage.from('attachments').remove([path])
  if (rmErr) return res.status(500).json({ error: rmErr.message })

  // 2) remove from record_attachments
  await supabase.from('record_attachments').delete().match({ record_id, field_id, path })

  // 3) update record_values array
  const { data: rv, error: getErr } = await supabase
    .from('record_values')
    .select('id, value')
    .eq('record_id', record_id)
    .eq('field_id', field_id)
    .single()

  if (!rv) return res.status(200).json({ ok: true })

  const arr = Array.isArray(rv.value) ? rv.value.filter((f) => f.path !== path) : []
  const { error: updErr } = await supabase.from('record_values').update({ value: arr }).eq('id', rv.id)
  if (updErr) return res.status(500).json({ error: updErr.message })

  return res.status(200).json({ ok: true })
}

export default withSentry(handler);
