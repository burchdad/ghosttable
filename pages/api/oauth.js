// API endpoint for third-party OAuth integrations (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let oauthConnections = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { provider, userId, token } = req.body;
      if (!provider || !userId || !token) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      oauthConnections.push({ provider, userId, token, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(oauthConnections);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('OAuth API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
