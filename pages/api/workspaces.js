import { withSentry } from '@sentry/nextjs'
// API endpoint for shared workspaces/folders (demo)
let workspaces = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { workspaceId, name, members } = req.body;
    if (!workspaceId || !name || !members) return res.status(400).json({ error: 'Missing fields' });
    workspaces.push({ workspaceId, name, members, ts: Date.now() });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(workspaces);
  }
  res.status(405).end();
}

export default withSentry(handler);
