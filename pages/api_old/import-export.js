// API endpoint for data import/export (demo)
import { secrets } from '../../lib/secrets';
import { withSentry } from '@sentry/nextjs'

let importedData = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Accept CSV/JSON data
      importedData.push({ ts: Date.now(), data: req.body });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      // Export as JSON
      return res.status(200).json(importedData);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Import/Export API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
