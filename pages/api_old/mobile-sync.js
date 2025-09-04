// API endpoint for mobile app sync (demo)
import { withSentry } from '@sentry/nextjs'

let syncs = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, device, status } = req.body;
      if (!userId || !device || !status) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      syncs.push({ userId, device, status, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(syncs);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Mobile Sync API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
