import { withSentry } from '@sentry/nextjs'
// API endpoint for voice assistant integration (demo)
let voices = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { assistant, command } = req.body;
    if (!assistant || !command) return res.status(400).json({ error: 'Missing fields' });
    voices.push({ assistant, command, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(voices);
  }
  res.status(405).end();
}

export default withSentry(handler);
