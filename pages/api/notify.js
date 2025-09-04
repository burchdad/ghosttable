import { withSentry } from '@sentry/nextjs'
// API endpoint to send notifications (demo)
function handler(req, res) {
  if (req.method === 'POST') {
    const { type, to, message } = req.body;
    if (!type || !to || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Simulate sending notification
    return res.status(200).json({ success: true, sent: { type, to, message } });
  }
  res.status(405).end();
}

export default withSentry(handler);
