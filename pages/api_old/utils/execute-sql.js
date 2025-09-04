import { runSQL } from '../../../lib/schema.js'


import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).end()


const { query } = req.body
try {
await runSQL(query)
res.status(200).json({ success: true })
} catch (err) {
res.status(500).json({ error: err.message })
}
}

export default withSentry(handler);
