// API endpoint for job scheduling (demo)
import { secrets } from '../../lib/secrets';

import { withSentry } from '@sentry/nextjs'

let jobs = [];

function handler(req, res) {
  // Example: Use secrets for API key management
  // const apiKey = secrets.JOBS_API_KEY;
  res.status(200).json({ jobs });
}

export default withSentry(handler);
