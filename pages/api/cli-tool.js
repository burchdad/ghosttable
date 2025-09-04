import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

// API endpoint for CLI tool automation (demo)
let cliCommands = [];

function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { command, args } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Missing command', code: 400 });
      }
      cliCommands.push({ command, args, ts: Date.now() });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json(cliCommands);
    }
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  } catch (err) {
    console.error('CLI Tool API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
