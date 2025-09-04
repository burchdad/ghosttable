// Sentry initialization for error monitoring
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '', // Set your Sentry DSN in environment variables
  tracesSampleRate: 1.0,
});

export default Sentry;
