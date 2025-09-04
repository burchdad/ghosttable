import { withSentry } from '@sentry/nextjs'
// API endpoint for data retention policies (demo)
let policies = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, policy } = req.body;
    if (!tableId || !policy) return res.status(400).json({ error: 'Missing fields' });
    policies.push({ tableId, policy, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(policies);
  }
  res.status(405).end();
}

export default withSentry(handler);
