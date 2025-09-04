import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { table_id } = req.query
    const { data, error } = await supabase
      .from('views').select('*').eq('table_id', table_id)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { table_id, name, config } = req.body
    const { data, error } = await supabase
      .from('views').insert([{ table_id, name, config: config || {} }]).select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
