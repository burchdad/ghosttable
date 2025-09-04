import { withSentry } from '@sentry/nextjs'
// API endpoint for custom scripting (demo, no sandbox)
let scripts = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: 'Missing fields' });
    scripts.push({ userId, code, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(scripts);
  }
  res.status(405).end();
}

export default withSentry(handler);
