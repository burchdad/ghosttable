import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for auto-tagging/categorization (demo)
let tags = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { tableId, tag } = req.body;
      if (!tableId || !tag) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      tags.push({ tableId, tag, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(tags);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Auto-Tag API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
