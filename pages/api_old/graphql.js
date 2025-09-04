// API endpoint for GraphQL queries (demo)
import { graphql, buildSchema } from 'graphql';
import { secrets } from '../../lib/secrets';

import { withSentry } from '@sentry/nextjs'

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = { hello: () => 'Hello world!' };

async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;
    const result = await graphql(schema, query, root);
    return res.status(200).json(result);
  }
  res.status(405).end();
}

export default withSentry(handler);
