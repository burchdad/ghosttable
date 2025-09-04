// API endpoint for form builder (demo)
import { secrets } from '../../lib/secrets';
import Sentry from '../../lib/sentry';

import { withSentry } from '@sentry/nextjs'

let forms = [];

function handler(req, res) {
  try {
    // Example: Use secrets for API key management
    // const apiKey = secrets.FORM_API_KEY;
    res.status(200).json({ forms });
  } catch (err) {
    console.error('Forms API Error:', err);
    Sentry.captureException(err); // Capture the error with Sentry
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
