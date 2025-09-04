// API endpoint for coupon/promo code management (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let coupons = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { code, discount, expires } = req.body;
      if (!code || discount === undefined || !expires) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      coupons.push({ code, discount, expires, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(coupons);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Coupons API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
