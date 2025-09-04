
import { withSentry } from '@sentry/nextjs'

async function getUser(req, res) {
  try {
    // ...existing code...
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).send('Internal Server Error');
  }
}

export default withSentry(getUser);
