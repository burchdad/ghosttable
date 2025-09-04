import { withSentry } from '@sentry/nextjs'
// API endpoint for predictive analytics (demo)
let predictions = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, input } = req.body;
    if (!tableId || !input) return res.status(400).json({ error: 'Missing fields' });
    // Simulate prediction
    const result = { prediction: Math.random(), input, ts: Date.now() };
    predictions.push(result);
    return res.status(200).json(result);
  }
  if (req.method === 'GET') {
    return res.status(200).json(predictions);
  }
  res.status(405).end();
}

export default withSentry(handler);
