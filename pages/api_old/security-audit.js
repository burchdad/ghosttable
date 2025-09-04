import { withSentry } from '@sentry/nextjs'
// API endpoint for security audit reports (demo)
let audits = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { reportId, userId, findings } = req.body;
    if (!reportId || !userId || !findings) return res.status(400).json({ error: 'Missing fields' });
    audits.push({ reportId, userId, findings, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(audits);
  }
  res.status(405).end();
}

export default withSentry(handler);
