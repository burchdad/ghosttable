import { withSentry } from '@sentry/nextjs'
// API endpoint for usage analytics (demo)
let usage = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, action } = req.body;
    if (!userId || !action) return res.status(400).json({ error: 'Missing fields' });
    usage.push({ userId, action, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(usage);
  }
  res.status(405).end();
}

export default withSentry(handler);
