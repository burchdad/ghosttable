import { withSentry } from '@sentry/nextjs'
// API endpoint for Zapier/IFTTT integration (demo)
let zaps = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { zapId, config } = req.body;
    if (!zapId || !config) return res.status(400).json({ error: 'Missing fields' });
    zaps.push({ zapId, config, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(zaps);
  }
  res.status(405).end();
}

export default withSentry(handler);
