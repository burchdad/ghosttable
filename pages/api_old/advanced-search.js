// API endpoint for advanced search/filtering (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let searches = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { query, options } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Missing query', code: 400 });
      }
      searches.push({ query, options, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(searches);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Advanced Search API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
