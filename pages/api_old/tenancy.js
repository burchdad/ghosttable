import { withSentry } from '@sentry/nextjs'
// API endpoint for multi-tenancy (demo)
let tenants = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { orgId, name } = req.body;
    if (!orgId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    tenants.push({ orgId, name, created: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(tenants);
  }
  res.status(405).end();
}

export default withSentry(handler);
