import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for custom branding/themes (demo)
let brands = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { orgId, theme } = req.body;
      if (!orgId || !theme) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      brands.push({ orgId, theme, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(brands);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Branding API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
