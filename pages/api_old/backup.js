import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for manual backup (demo)
let backups = [];

function handler(req, res) {
  if (req.method === 'POST') {
    backups.push({ ts: Date.now(), data: 'demo' });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(backups);
  }
  res.status(405).end();
}

export default withSentry(handler);
