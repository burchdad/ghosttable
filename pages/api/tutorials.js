import { withSentry } from '@sentry/nextjs'
// API endpoint for in-app tutorials/walkthroughs (demo)
let tutorials = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { tutorialId, content } = req.body;
    if (!tutorialId || !content) return res.status(400).json({ error: 'Missing fields' });
    tutorials.push({ tutorialId, content, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(tutorials);
  }
  res.status(405).end();
}

export default withSentry(handler);
