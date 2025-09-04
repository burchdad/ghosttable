'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '../../lib/supabase-browser'

type Field = { id: string; name: string; type: string; options?: any }
type Cell = { field_id: string; value: any }
type RecordRow = { id: string; values: Cell[] }

export default function RecordDrawer({
  open,
  onClose,
  tableId,
  record,
  fields,
  onSaved,      // callback(recordId, fieldId, newCellRow)
}: {
  open: boolean
  onClose: () => void
  tableId: string
  record: RecordRow
  fields: Field[]
  onSaved?: (recordId: string, fieldId: string, cellRow: any) => void
}) {
  const [local, setLocal] = useState<RecordRow>(record)
  useEffect(() => setLocal(record), [record?.id])

  // helpers
  const get = (fid: string) => (local.values || []).find(v => v.field_id === fid)?.value
  const setLocalVal = (fid: string, v: any) => {
    setLocal(prev => {
      const exists = (prev.values || []).some(x => x.field_id === fid)
      return exists
        ? { ...prev, values: prev.values.map(x => x.field_id === fid ? { ...x, value: v } : x) }
        : { ...prev, values: [...(prev.values || []), { field_id: fid, value: v }] }
    })
  }

  async function saveCell(field_id: string, value: any) {
    const res = await fetch('/api/cells', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record_id: local.id, field_id, value })
    })
    const saved = await res.json().catch(()=>null)
    if (!res.ok || !saved || saved.error) { alert('Save failed'); return }
    onSaved?.(local.id, field_id, saved)
    setLocalVal(field_id, saved.value)
  }

  // attachment helpers (same flow you use in grid)
  async function signedUrl(path: string, seconds = 120) {
    const q = new URLSearchParams({ path, expiresIn: String(seconds) })
    const r = await fetch(`/api/attachments/url?${q}`).then(r=>r.json())
    return r?.url as string
  }
  async function addAttachment(fid: string, file: File) {
    const sig = await fetch('/api/attachments/sign', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ record_id: local.id, field_id: fid, filename: file.name })
    }).then(r=>r.json())
    if (sig?.error) return alert(sig.error)
    const up = await supabaseBrowser.storage.from('attachments').uploadToSignedUrl(sig.path, sig.token, file)
    if (up.error) return alert(up.error.message)
    const meta = { path: sig.path, name: file.name, size: file.size, type: file.type }
    const resp = await fetch('/api/attachments/save', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ record_id: local.id, field_id: fid, file: meta })
    }).then(r=>r.json())
    if (resp?.error) return alert(resp.error)
    const cur = get(fid)
    const next = Array.isArray(cur) ? [...cur, meta] : [meta]
    setLocalVal(fid, next)
  }
  async function delAttachment(fid: string, path: string) {
    const resp = await fetch('/api/attachments/delete', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ record_id: local.id, field_id: fid, path })
    }).then(r=>r.json())
    if (resp?.error) return alert(resp.error)
    const cur = get(fid)
    const next = (Array.isArray(cur) ? cur : []).filter((f:any)=>f.path !== path)
    setLocalVal(fid, next)
  }

  // mini formula evaluator (read-only)
  function evalFormula(expr: string) {
    if (!expr) return ''
    const valForField = (name: string) => {
      const f = fields.find(x => x.name.toLowerCase() === name.toLowerCase())
      if (!f) return 0
      const v = get(f.id); const n = Number(v)
      return Number.isNaN(n) ? 0 : n
    }
    const replaced = expr.replace(/\{([^}]+)\}/g, (_, name) => String(valForField(name)))
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('Math', `return (${replaced})`)
      const out = fn(Math)
      return (out == null || Number.isNaN(out)) ? '' : String(out)
    } catch { return '' }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      {/* panel */}
      <div className="relative ml-auto h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Record</div>
          <button className="text-sm underline" onClick={onClose}>Close</button>
        </div>

        <div className="p-4 space-y-4">
          {fields.map(f => {
            const v = get(f.id)
            // checkbox
            if (f.type === 'checkbox') {
              return (
                <label key={f.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={Boolean(v)}
                         onChange={e => saveCell(f.id, e.target.checked)} />
                  <span className="font-medium">{f.name}</span>
                </label>
              )
            }
            // select
            if (f.type === 'select') {
              const choices: string[] = Array.isArray(f.options?.choices) ? f.options.choices : []
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  <select className="border p-2 rounded" value={v ?? ''} onChange={e => saveCell(f.id, e.target.value)}>
                    <option value=""></option>
                    {choices.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )
            }
            // multi_select
            if (f.type === 'multi_select') {
              const choices: string[] = Array.isArray(f.options?.choices) ? f.options.choices : []
              const selected: string[] = Array.isArray(v) ? v : []
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  <select className="border p-2 rounded" multiple value={selected}
                          onChange={e => {
                            const arr = Array.from(e.target.selectedOptions).map(o=>o.value)
                            saveCell(f.id, arr)
                          }}>
                    {choices.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )
            }
            // link (single)
            if (f.type === 'link') {
              // For simplicity, show the raw id and allow paste; your grid has the nicer picker
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name} (linked record id)</label>
                  <input className="border p-2 rounded" value={v ?? ''} onChange={e => saveCell(f.id, e.target.value)} />
                </div>
              )
            }
            // date/datetime
            if (f.type === 'date' || f.type === 'datetime') {
              const type = f.type === 'date' ? 'date' : 'datetime-local'
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  <input type={type} className="border p-2 rounded" value={v ?? ''} onChange={e => saveCell(f.id, e.target.value)} />
                </div>
              )
            }
            // attachment
            if (f.type === 'attachment') {
              const list = Array.isArray(v) ? v : []
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  <input type="file" multiple
                         onChange={e => {
                           const files = Array.from(e.target.files || [])
                           files.forEach(file => addAttachment(f.id, file))
                           e.currentTarget.value = ''
                         }} />
                  <div className="flex flex-wrap gap-2">
                    {list.map((file:any, i:number) => (
                      <div key={file.path || i} className="text-xs flex items-center gap-2 border rounded px-2 py-1">
                        <button className="underline" onClick={async ()=> {
                          const u = await signedUrl(file.path, 120); if (u) window.open(u, '_blank')
                        }}>{file.name || 'file'}</button>
                        <span className="text-gray-500">{Math.round((file.size||0)/1024)}kB</span>
                        <button className="text-red-600" onClick={()=>delAttachment(f.id, file.path)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            // formula (read-only)
            if (f.type === 'formula') {
              return (
                <div key={f.id} className="grid gap-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  <div className="p-2 border rounded bg-gray-50">{evalFormula(f.options?.expr || '')}</div>
                </div>
              )
            }
            // default text/number
            const inputType = f.type === 'number' ? 'number' : 'text'
            return (
              <div key={f.id} className="grid gap-1">
                <label className="text-sm font-medium">{f.name}</label>
                <input type={inputType} className="border p-2 rounded"
                       value={v ?? ''} onChange={e => setLocalVal(f.id, e.target.value)}
                       onBlur={e => saveCell(f.id, e.target.value)} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
