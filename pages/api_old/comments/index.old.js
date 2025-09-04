import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { record_id } = req.query
    if (!record_id) return res.status(400).json({ error: 'record_id required' })
    const { data, error } = await supabase
      .from('record_comments')
      .select('*')
      .eq('record_id', record_id)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { record_id, body, user_id = null } = req.body || {}
    if (!record_id || !body) return res.status(400).json({ error: 'record_id and body required' })
    const { data, error } = await supabase
      .from('record_comments')
      .insert([{ record_id, body, user_id }])
      .select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json((data || [])[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
