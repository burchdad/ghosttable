// API endpoint for data lake integration (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let lakes = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { provider, config } = req.body;
      if (!provider || !config) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      lakes.push({ provider, config, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(lakes);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Data Lake API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
