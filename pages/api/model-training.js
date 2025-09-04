import { withSentry } from '@sentry/nextjs'
// API endpoint for custom AI model training (demo)
let trainings = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { modelName, data } = req.body;
      if (!modelName || !data) {
        return res.status(400).json({ error: 'Missing fields', code: 400 });
      }
      trainings.push({ modelName, data, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(trainings);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('Model Training API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
