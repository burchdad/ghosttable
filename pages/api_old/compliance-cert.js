// API endpoint for custom compliance certifications (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let certs = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { certId, name, details } = req.body;
      if (!certId || !name || !details) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      certs.push({ certId, name, details, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(certs);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Compliance Cert API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
