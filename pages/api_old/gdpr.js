import { secrets } from '../../lib/secrets';
import { withSentry } from '@sentry/nextjs'

// API endpoint for GDPR/CCPA compliance (demo)
let requests = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, type, details } = req.body;
      if (!userId || !type || !details) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      requests.push({ userId, type, details, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(requests);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('GDPR API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
