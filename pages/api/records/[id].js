import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    // gather attachment paths first
    const { data: metas } = await supabase
      .from('record_attachments')
      .select('path')
      .eq('record_id', id)

    if (Array.isArray(metas) && metas.length) {
      await supabase.storage.from('attachments').remove(metas.map(m => m.path))
      await supabase.from('record_attachments').delete().eq('record_id', id)
    }

    // remove cell values
    const { error: dvErr } = await supabase.from('record_values').delete().eq('record_id', id)
    if (dvErr) return res.status(500).json({ error: dvErr.message })

    // finally delete the record
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
