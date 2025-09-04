// API endpoint for activity feed/timeline (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let activities = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, activity } = req.body;
      if (!userId || !activity) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      activities.push({ userId, activity, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(activities);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Activity Feed Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
