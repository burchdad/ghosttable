// API endpoint for multi-language/localization support (demo)
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let locales = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { language, config } = req.body;
      if (!language || !config) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      locales.push({ language, config, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(locales);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Localization API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
