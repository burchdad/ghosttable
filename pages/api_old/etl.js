// API endpoint for ETL jobs (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let etlJobs = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { source, mapping, schedule } = req.body;
      if (!source || !mapping) {
        return res.status(400).json({ error: 'Missing required fields', code: 400 });
      }
      etlJobs.push({ source, mapping, schedule, created: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(etlJobs);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('ETL API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
