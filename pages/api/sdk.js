import { withSentry } from '@sentry/nextjs'
// API endpoint for SDKs for popular languages (demo)
let sdks = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { language, version } = req.body;
    if (!language || !version) return res.status(400).json({ error: 'Missing fields' });
    sdks.push({ language, version, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(sdks);
  }
  res.status(405).end();
}

export default withSentry(handler);
