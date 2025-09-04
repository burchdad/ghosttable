import { withSentry } from '@sentry/nextjs'
// API endpoint to save scheduled report requests
// For demo: saves to in-memory array
let scheduledReports = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { email, frequency, tableId, fields } = req.body;
    if (!email || !frequency || !tableId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    scheduledReports.push({ email, frequency, tableId, fields, created: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(scheduledReports);
  }
  res.status(405).end();
}

export default withSentry(handler);
