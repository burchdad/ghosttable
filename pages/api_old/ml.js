// API endpoint for ML/AI analytics (demo)
import { withSentry } from '@sentry/nextjs'

let models = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { type, data } = req.body;
      if (!type || !data) {
        return res.status(400).json({ error: 'Missing required fields', code: 400 });
      }
      models.push({ type, data, created: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(models);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('ML API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
