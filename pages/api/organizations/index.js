// pages/api/organizations/index.js
import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name } = req.body
    const { data, error } = await supabase
      .from('organizations')
      .insert([{ name }])
      .select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withSentry(handler);
