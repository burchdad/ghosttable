// API endpoint for data quality/validation rules (demo)
import { secrets } from '../../lib/secrets';
import { withSentry } from '@sentry/nextjs'

let rules = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { tableId, field, rule } = req.body;
      if (!tableId || !field || !rule) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      rules.push({ tableId, field, rule, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(rules);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Validation API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
