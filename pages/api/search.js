import { withSentry } from '@sentry/nextjs'
// API endpoint for advanced search (demo)
let records = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query' });
    }
    // Simulate full-text search
    const results = records.filter(r => JSON.stringify(r).includes(query));
    return res.status(200).json(results);
  }
  res.status(405).end();
}

export default withSentry(handler);
