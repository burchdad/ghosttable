// API endpoint for data archiving/cold storage (demo)
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let archives = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { tableId, data } = req.body;
      if (!tableId || !data) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      archives.push({ tableId, data, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(archives);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Archive API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
