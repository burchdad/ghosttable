// API endpoint for webhook event history (demo)
import { secrets } from '../../lib/secrets';
import { withSentry } from '@sentry/nextjs'

let webhookEvents = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { url, status, payload } = req.body;
      if (!url || !status || !payload) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      webhookEvents.push({ url, status, payload, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(webhookEvents);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Webhook History API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
