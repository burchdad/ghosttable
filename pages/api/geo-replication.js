import { withSentry } from '@sentry/nextjs'
// API endpoint for multi-region/geo-replication (demo)
let regions = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { region, tableId } = req.body;
    if (!region || !tableId) return res.status(400).json({ error: 'Missing fields' });
    regions.push({ region, tableId, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(regions);
  }
  res.status(405).end();
}

export default withSentry(handler);
