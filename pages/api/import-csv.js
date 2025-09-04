import { supabase } from '../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow',['POST']); return res.status(405).end() }
  const { table_id, rows } = req.body || {}
  if (!table_id || !Array.isArray(rows)) return res.status(400).json({ error: 'table_id and rows[] required' })

  // fetch fields map by name (case-insensitive)
  const { data: fields, error: fErr } = await supabase.from('fields').select('*').eq('table_id', table_id)
  if (fErr) return res.status(500).json({ error: fErr.message })
  const byName = new Map(fields.map(f => [f.name.toLowerCase(), f]))

  let created = 0
  for (const row of rows) {
    const { data: r, error: rErr } = await supabase.from('records').insert([{ table_id }]).select()
    if (rErr) return res.status(500).json({ error: rErr.message, created })
    const rec = r[0]

    for (const [col, raw] of Object.entries(row)) {
      const f = byName.get(String(col).toLowerCase())
      if (!f) continue
      let value = raw
      if (f.type === 'number') {
        const n = Number(raw); value = Number.isNaN(n) ? null : n
      } else if (f.type === 'checkbox') {
        value = ['true','1','yes','y','on'].includes(String(raw).toLowerCase())
      } else if (f.type === 'multi_select') {
        // CSV cell like "a; b; c" -> array
        value = String(raw).split(/[;,]/).map(s=>s.trim()).filter(Boolean)
      }
      const { error: vErr } = await supabase.from('record_values')
        .upsert([{ record_id: rec.id, field_id: f.id, value }], { onConflict: 'record_id,field_id' })
      if (vErr) return res.status(500).json({ error: vErr.message, created })
    }
    created++
  }
  return res.status(200).json({ created })
}

export default withSentry(handler);
