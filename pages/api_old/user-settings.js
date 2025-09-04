// API endpoint for user preferences/settings (demo)
import { secrets } from '../../lib/secrets';
import { withSentry } from '@sentry/nextjs'

let settings = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, prefs } = req.body;
      if (!userId || !prefs) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      settings.push({ userId, prefs, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(settings);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('User Settings API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
