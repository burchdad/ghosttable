// API endpoint for third-party tools to access analytics/automation data (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Simulate returning analytics and automations
      return res.status(200).json({ analytics: 'demo', automations: 'demo' });
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('External API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
