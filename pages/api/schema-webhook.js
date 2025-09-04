import { withSentry } from '@sentry/nextjs'
// API endpoint for webhooks on schema changes (demo)
let schemaEvents = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { event, tableId, details } = req.body;
    if (!event || !tableId || !details) return res.status(400).json({ error: 'Missing fields' });
    schemaEvents.push({ event, tableId, details, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(schemaEvents);
  }
  res.status(405).end();
}

export default withSentry(handler);
