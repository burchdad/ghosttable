// API endpoint for API key management (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let apiKeys = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId', code: 400 });
      }
      const key = Math.random().toString(36).substring(2, 18);
      apiKeys.push({ userId, key, created: Date.now() });
      return res.status(200).json({ key });
    }
    if (req.method === 'DELETE') {
      const { key } = req.body;
      apiKeys = apiKeys.filter(k => k.key !== key);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(apiKeys);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('API Keys API Error:', err);
    Sentry.captureException(err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
