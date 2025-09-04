import { withSentry } from '@sentry/nextjs'
// API endpoint for webhook event subscriptions (demo)
let subscriptions = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { event, url } = req.body;
    if (!event || !url) return res.status(400).json({ error: 'Missing fields' });
    subscriptions.push({ event, url, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(subscriptions);
  }
  res.status(405).end();
}

export default withSentry(handler);
