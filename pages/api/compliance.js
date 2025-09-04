// API endpoint for GDPR/CCPA compliance (demo)
let userData = [];
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { action, userId } = req.body;
      if (!action || !userId) {
        return res.status(400).json({ error: 'Missing required fields', code: 400 });
      }
      if (action === 'export') {
        return res.status(200).json({ data: userData.filter(u => u.userId === userId) });
      }
      if (action === 'delete') {
        userData = userData.filter(u => u.userId !== userId);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown action', code: 400 });
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Compliance API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
