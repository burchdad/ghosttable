// API endpoint to connect/query external databases (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';
import { withSentry } from '@sentry/nextjs'

let connections = [];

function handler(req, res) {
  if (req.method === 'POST') {
    const { type, host, port, user, password, database } = req.body;
    if (!type || !host || !port || !user || !password || !database) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    connections.push({ type, host, port, user, password, database });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    return res.status(200).json(connections);
  }
  res.status(405).end();
}

export default withSentry(handler);
