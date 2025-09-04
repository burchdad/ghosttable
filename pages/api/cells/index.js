import { supabase } from '../../../lib/supabase'


import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
if (req.method !== 'PUT' && req.method !== 'POST') {
res.setHeader('Allow', ['PUT', 'POST'])
return res.status(405).end(`Method ${req.method} Not Allowed`)
}


const { record_id, field_id, value } = req.body

		// deny writes if another active lock exists
		const { data: lock } = await supabase
			.from('record_locks')
			.select('expires_at')
			.eq('record_id', record_id)
			.limit(1)
		if (lock?.[0] && new Date(lock[0].expires_at) > new Date()) {
			throw { message: 'Record is locked' }
		}

// Upsert the cell value (unique(record_id, field_id) exists)
const { data, error } = await supabase
.from('record_values')
.upsert([{ record_id, field_id, value }], { onConflict: 'record_id,field_id' })
.select()


if (error) return res.status(500).json({ error: error.message })
return res.status(200).json(data[0])
}

export default withSentry(handler);
