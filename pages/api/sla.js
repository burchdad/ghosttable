import { withSentry } from '@sentry/nextjs'
// API endpoint for SLA monitoring (demo)
let slas = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { service, uptime } = req.body;
    if (!service || uptime === undefined) return res.status(400).json({ error: 'Missing fields' });
    slas.push({ service, uptime, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(slas);
  }
  res.status(405).end();
}

export default withSentry(handler);
