import { withSentry } from '@sentry/nextjs'
// API endpoint for data snapshotting (demo)
let snapshots = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, data } = req.body;
    if (!tableId || !data) return res.status(400).json({ error: 'Missing fields' });
    snapshots.push({ tableId, data, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(snapshots);
  }
  res.status(405).end();
}

export default withSentry(handler);
