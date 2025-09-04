// API endpoint for accessibility features (WCAG compliance) (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let accessibility = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { feature, enabled } = req.body;
      if (!feature || enabled === undefined) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      accessibility.push({ feature, enabled, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(accessibility);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Accessibility API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
