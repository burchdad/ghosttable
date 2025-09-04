// API endpoint for geospatial features (demo)
import { secrets } from '../../lib/secrets';

import { withSentry } from '@sentry/nextjs'

let geoData = [];

function handler(req, res) {
  try {
    // Example: Use secrets for API key management
    // const apiKey = secrets.GEO_API_KEY;
    res.status(200).json({ geoData });
  } catch (err) {
    console.error('Geo API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

export default withSentry(handler);
