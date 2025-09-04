// API endpoint for end-to-end encryption toggle (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let encryption = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, enabled } = req.body;
    if (!userId || enabled === undefined) return res.status(400).json({ error: 'Missing fields' });
    encryption.push({ userId, enabled, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(encryption);
  }
  res.status(405).end();
}

export default withSentry(handler);
