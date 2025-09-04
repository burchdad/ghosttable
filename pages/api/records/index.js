import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { table_id } = req.query
    const { data: records, error: rErr } = await supabase.from('records').select('*').eq('table_id', table_id).order('created_at', { ascending: true })
    if (rErr) return res.status(500).json({ error: rErr.message })

    const recordIds = records.map(r => r.id)
    if (recordIds.length === 0) return res.status(200).json([])

    const { data: values, error: vErr } = await supabase
      .from('record_values')
      .select('*')
      .in('record_id', recordIds)

    if (vErr) return res.status(500).json({ error: vErr.message })

    const result = records.map(r => ({
      ...r,
      values: values.filter(v => v.record_id === r.id)
    }))

    return res.status(200).json(result)
  }

  if (req.method === 'POST') {
    const { table_id } = req.body
    const { data, error } = await supabase.from('records').insert([{ table_id }]).select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
