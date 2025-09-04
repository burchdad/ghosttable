import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for export to PDF/Excel/PowerPoint (demo)
let exports = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { type, tableId, data } = req.body;
      if (!type || !tableId || !data) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      exports.push({ type, tableId, data, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(exports);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Export API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
