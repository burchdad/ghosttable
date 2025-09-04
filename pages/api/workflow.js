import { withSentry } from '@sentry/nextjs'
// API endpoint for approval workflows (demo)
let workflows = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { workflowId, steps } = req.body;
    if (!workflowId || !steps) return res.status(400).json({ error: 'Missing fields' });
    workflows.push({ workflowId, steps, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(workflows);
  }
  res.status(405).end();
}

export default withSentry(handler);
