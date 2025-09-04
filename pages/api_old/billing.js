import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for billing/subscription management (demo)
let bills = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, plan, amount } = req.body;
      if (!userId || !plan || amount === undefined) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      bills.push({ userId, plan, amount, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(bills);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Billing API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
