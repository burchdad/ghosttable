// API endpoint for data import from external sources (demo)
import { withSentry } from '@sentry/nextjs'

let imports = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { source, config } = req.body;
      if (!source || !config) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      imports.push({ source, config, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(imports);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Import External API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
