import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for two-factor authentication (2FA) (demo)
let twofa = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, method } = req.body;
    if (!userId || !method) return res.status(400).json({ error: 'Missing fields' });
    twofa.push({ userId, method, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(twofa);
  }
  res.status(405).end();
}

export default withSentry(handler);
