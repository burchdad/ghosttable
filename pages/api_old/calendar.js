import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for shared calendar/scheduling (demo)
let calendars = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { calendarId, events } = req.body;
      if (!calendarId || !events) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      calendars.push({ calendarId, events, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(calendars);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Calendar API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
