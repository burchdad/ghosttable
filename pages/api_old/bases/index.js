import { supabase } from '../../../lib/supabase'


import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
if (req.method === 'GET') {
const { data, error } = await supabase.from('bases').select('*')
if (error) return res.status(500).json({ error: error.message })
return res.status(200).json(data)
}


if (req.method === 'POST') {
const { name, organization_id } = req.body
const { data, error } = await supabase.from('bases').insert([{ name, organization_id }]).select()
if (error) return res.status(500).json({ error: error.message })
return res.status(201).json(data[0])
}


res.setHeader('Allow', ['GET', 'POST'])
res.status(405).end(`Method ${req.method} Not Allowed`)
}

const { data: ping, error: pingErr } = await supabase.from('organizations').select('*').limit(1)
console.log('PING:', ping, pingErr)

export default withSentry(handler);
