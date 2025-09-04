import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { table_id } = req.query
    const q = supabase.from('automations').select('*').order('created_at', { ascending: false })
    const { data, error } = table_id ? await q.eq('table_id', table_id) : await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { base_id, table_id, name, trigger, actions, active = true } = req.body || {}
    if (!table_id || !name || !trigger || !actions) return res.status(400).json({ error: 'name, table_id, trigger, actions required' })
    const { data, error } = await supabase.from('automations').insert([{ base_id, table_id, name, trigger, actions, active }]).select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json((data||[])[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
