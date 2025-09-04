// API endpoint for integrations (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

let integrations = [];

function handler(req, res) {
  // Example: Use secrets for API key management
  // const apiKey = secrets.INTEGRATIONS_API_KEY;
  res.status(200).json({ integrations });
}

export default withSentry(handler);
