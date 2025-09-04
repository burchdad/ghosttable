import { supabase } from '../../../lib/supabase'
import { createApi, zBody, AppError } from '../../../lib/api-tools'

export default createApi(
  { bodySchema: zBody({ snapshot_id: z.string().uuid(), new_base_name: z.string() }) },
  async ({ body }) => {
    const { data: rows, error: gErr } = await supabase.from('base_snapshots').select('base_id, snapshot').eq('id', body.snapshot_id).limit(1)
    if (gErr || !rows?.[0]) throw new AppError(404, 'not_found', 'Snapshot not found')
    const snap = rows[0].snapshot

    // new base under same org as original
    const { data: baseRow } = await supabase.from('bases').select('organization_id').eq('id', rows[0].base_id).limit(1)
    const org = baseRow?.[0]?.organization_id
    const { data: nb, error: bErr } = await supabase.from('bases').insert([{ organization_id: org, name: body.new_base_name }]).select().single()
    if (bErr) throw bErr

    // maps old table/field ids by name into new ones
    const tables = snap.tables || []
    const fields = snap.fields || []
    const recs   = snap.records || []
    const vals   = snap.values || []

    // create tables
    const tblMap = new Map()
    for (const t of tables) {
      const { data: nt, error } = await supabase.from('tables').insert([{ base_id: nb.id, name: t.name }]).select().single()
      if (error) throw error
      tblMap.set(t.id, nt.id)
    }

    // create fields
    const fldMap = new Map()
    for (const f of fields) {
      const tid = tblMap.get(f.table_id)
      const { data: nf, error } = await supabase.from('fields').insert([{
        table_id: tid, name: f.name, type: f.type, options: f.options || null, position: f.position
      }]).select().single()
      if (error) throw error
      fldMap.set(f.id, nf.id)
    }

    // create records
    const recMap = new Map()
    for (const r of recs) {
      const tid = tblMap.get(r.table_id)
      const { data: nr, error } = await supabase.from('records').insert([{ table_id: tid }]).select().single()
      if (error) throw error
      recMap.set(r.id, nr.id)
    }

    // create values
    if (vals?.length) {
      const rowsIns = vals.map(v => ({
        record_id: recMap.get(v.record_id),
        field_id:  fldMap.get(v.field_id),
        value:     v.value,
        table_id:  tblMap.get((recs.find(r => r.id === v.record_id) || {}).table_id)
      })).filter(x => x.record_id && x.field_id && x.table_id)
      if (rowsIns.length) {
        const { error } = await supabase.from('record_values').insert(rowsIns)
        if (error) throw error
      }
    }

    return { base_id: nb.id }
  }
)
