// API endpoint for notification preferences (demo)
import Sentry from '../../lib/sentry';
// API endpoint for notification preferences (demo)
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let prefs = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, channels } = req.body;
      if (!userId || !channels) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      prefs.push({ userId, channels, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(prefs);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Notification Prefs API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
