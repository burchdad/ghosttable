// API endpoint for data encryption & key management (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let keys = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { keyName, keyValue } = req.body;
    if (!keyName || !keyValue) return res.status(400).json({ error: 'Missing fields' });
    keys.push({ keyName, keyValue, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(keys);
  }
  res.status(405).end();
}

export default withSentry(handler);
