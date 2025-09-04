import { withSentry } from '@sentry/nextjs'
// API endpoint for usage-based pricing (demo)
let prices = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, usage, price } = req.body;
    if (!userId || usage === undefined || price === undefined) return res.status(400).json({ error: 'Missing fields' });
    prices.push({ userId, usage, price, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(prices);
  }
  res.status(405).end();
}

export default withSentry(handler);
