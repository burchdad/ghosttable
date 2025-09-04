import { withSentry } from '@sentry/nextjs'
// API endpoint for system monitoring/metrics (demo)
let metrics = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { metric, value } = req.body;
      if (!metric || value === undefined) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      metrics.push({ metric, value, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(metrics);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Monitoring API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
