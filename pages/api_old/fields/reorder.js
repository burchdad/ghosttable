import { supabase } from '../../../lib/supabase'
import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']); return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const { table_id, order } = req.body || {}
  if (!table_id || !Array.isArray(order)) return res.status(400).json({ error:'table_id and order[] required' })
  for (let i=0;i<order.length;i++) {
    const { error } = await supabase.from('fields').update({ position: i+1 }).eq('id', order[i])
    if (error) return res.status(500).json({ error: error.message })
  }
  res.status(200).json({ success:true })
}

export default withSentry(handler);
