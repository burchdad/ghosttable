import { withSentry } from '@sentry/nextjs'
// API endpoint for health check/status (demo)
function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', ts: Date.now() });
  }
  res.status(405).end();
}

export default withSentry(handler);
