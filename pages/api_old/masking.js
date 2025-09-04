// API endpoint for data masking/redaction (demo)
let masks = [];

import { withSentry } from '@sentry/nextjs'

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { tableId, field, maskType } = req.body;
      if (!tableId || !field || !maskType) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      masks.push({ tableId, field, maskType, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(masks);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Masking API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
