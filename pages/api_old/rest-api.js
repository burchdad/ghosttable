import { withSentry } from '@sentry/nextjs'
// API endpoint for REST API for custom apps (demo)
let restEndpoints = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { endpoint, config } = req.body;
    if (!endpoint || !config) return res.status(400).json({ error: 'Missing fields' });
    restEndpoints.push({ endpoint, config, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(restEndpoints);
  }
  res.status(405).end();
}

export default withSentry(handler);
