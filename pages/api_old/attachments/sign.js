import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end() }

  const { record_id, field_id, filename } = req.body || {}
  if (!record_id || !field_id || !filename) {
    return res.status(400).json({ error: 'record_id, field_id, filename required' })
  }

  const path = `${record_id}/${field_id}/${Date.now()}_${filename}`

  const { data, error } = await supabase
    .storage
    .from('attachments')
    .createSignedUploadUrl(path)

  if (error) return res.status(500).json({ error: error.message })

  // { signedUrl, token }
  return res.status(200).json({ path, ...data })
}

export default withSentry(handler);
