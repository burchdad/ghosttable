import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

// API endpoint for gamification (badges, leaderboards) (demo)
let gamify = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { userId, badge, score } = req.body;
      if (!userId || !badge || score === undefined) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      gamify.push({ userId, badge, score, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(gamify);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Gamification API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
