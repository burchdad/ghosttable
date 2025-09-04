// API endpoint for disaster recovery (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let recoveries = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { planId, status } = req.body;
      if (!planId || !status) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      recoveries.push({ planId, status, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(recoveries);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Disaster Recovery API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
