import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', ['GET']); return res.status(405).end() }

  const { path, expiresIn } = req.query
  if (!path) return res.status(400).json({ error: 'path required' })

  const { data, error } = await supabase
    .storage
    .from('attachments')
    .createSignedUrl(String(path), Number(expiresIn) || 60) // seconds

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ url: data?.signedUrl })
}

export default withSentry(handler);
