import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', ['GET']); return res.status(405).end() }
  const { record_id, table_id, limit = 50 } = req.query
  if (!record_id && !table_id) return res.status(400).json({ error: 'record_id or table_id required' })

  let q = supabase.from('record_activity').select('*').order('created_at', { ascending: false }).limit(Number(limit))
  if (record_id) q = q.eq('record_id', record_id)
  if (table_id) q = q.eq('table_id', table_id)
  const { data, error } = await q
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data || [])
}

export default withSentry(handler);
