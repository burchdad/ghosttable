import { supabase } from '../../../lib/supabase'

import { withSentry } from '@sentry/nextjs'

function matchesCondition(cond, ctx) {
  if (!cond || cond.op === 'always') return true
  const vNew = ctx.new_value
  const vOld = ctx.old_value
  const valStr = (vNew == null ? '' : String(vNew)).toLowerCase()
  const argStr = (cond.value == null ? '' : String(cond.value)).toLowerCase()
  if (cond.op === 'equals')    return valStr === argStr
  if (cond.op === 'contains')  return valStr.includes(argStr)
  if (cond.op === 'changed_to')return (String(vOld ?? '') !== String(vNew ?? '')) && (valStr === argStr)
  return false
}

async function runAction(action, ctx) {
  if (action.type === 'webhook') {
    const method = action.method || 'POST'
    const body = action.body ?? {
      table_id: ctx.table_id, record_id: ctx.record_id, event: ctx.event,
      field_id: ctx.field_id, old_value: ctx.old_value, new_value: ctx.new_value
    }
    const r = await fetch(action.url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    })
    if (!r.ok) throw new Error(`webhook ${r.status}`)
    return
  }

  if (action.type === 'update_record') {
    // set is a map: { "<field_id>": <json> }
    const entries = Object.entries(action.set || {})
    for (const [field_id, value] of entries) {
      const { error } = await supabase
        .from('record_values')
        .upsert([{ record_id: ctx.record_id, field_id, value, table_id: ctx.table_id }], { onConflict: 'record_id,field_id' })
      if (error) throw error
    }
    return
  }

  throw new Error(`unknown action type: ${action.type}`)
}

async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end() }

  const limit = Number(req.body?.limit || 20)
  const now = new Date().toISOString()

  // 1) pull queue
  const { data: q, error: qErr } = await supabase
    .from('automation_queue')
    .select('*')
    .lte('next_run_at', now)
    .order('enqueued_at', { ascending: true })
    .limit(limit)
  if (qErr) return res.status(500).json({ error: qErr.message })

  const results = []

  for (const item of q || []) {
    const ctx = {
      queue_id: item.id,
      table_id: item.table_id,
      record_id: item.record_id,
      field_id: item.field_id,
      event: item.event,
      old_value: item.old_value,
      new_value: item.new_value
    }

    // 2) find automations for this table and event
    const { data: autos, error: aErr } = await supabase
      .from('automations')
      .select('*')
      .eq('table_id', item.table_id)
      .eq('active', true)
    if (aErr) { results.push({ id:item.id, status:'error', error:aErr.message }); continue }

    let okAll = true, errMsg = ''

    for (const auto of autos) {
      const trg = auto.trigger || {}
      if (trg.event && trg.event !== item.event) continue
      if (trg.field_id && trg.field_id !== item.field_id) continue
      if (!matchesCondition(trg.condition, ctx)) continue

      // 3) execute actions
      try {
        for (const act of (auto.actions || [])) {
          await runAction(act, ctx)
        }
        await supabase.from('automation_runs').insert([{
          automation_id: auto.id, queue_id: item.id, status: 'ok', finished_at: new Date().toISOString()
        }])
      } catch (e) {
        okAll = false
        errMsg = String(e.message || e)
        await supabase.from('automation_runs').insert([{
          automation_id: auto.id, queue_id: item.id, status: 'error', error: errMsg, finished_at: new Date().toISOString()
        }])
        break
      }
    }

    if (okAll) {
      await supabase.from('automation_queue').delete().eq('id', item.id)
      results.push({ id:item.id, status:'ok' })
    } else {
      const backoffMin = Math.min(30, (item.attempts || 0) * 5 + 1)
      const next = new Date(Date.now() + backoffMin * 60 * 1000).toISOString()
      await supabase
        .from('automation_queue')
        .update({ attempts: (item.attempts || 0) + 1, next_run_at: next })
        .eq('id', item.id)
      results.push({ id:item.id, status:'error', error: errMsg })
    }
  }

  return res.status(200).json({ processed: (q||[]).length, results })
}

export default withSentry(handler);
