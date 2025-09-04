'use client'

import { useEffect, useState } from 'react'

type Base = { id: string; name: string }

export default function Page() {
  const [bases, setBases] = useState<Base[]>([])
  const [baseId, setBaseId] = useState('')
  const [tableName, setTableName] = useState('Contacts')
  const [spec, setSpec] = useState(
    // one field per line: Label:Type   (Types: text | number | checkbox)
    `Name:text
Email:text
Amount:number
Active:checkbox`
  )
  const [result, setResult] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    fetch('/api/bases')
      .then(r => r.json())
      .then(a => setBases(Array.isArray(a) ? a : []))
      .catch(() => setBases([]))
  }, [])

  function parseSpec(s: string) {
    return s
      .split(/\r?\n/)
      .map((line, i) => {
        const t = line.trim()
        if (!t) return null

        // Allow formats:
        //   Label:select(Option A, Option B)
        //   Label:text | number | checkbox
        const [labelRaw, typeRaw = 'text'] = t.split(':')
        const name = (labelRaw || '').trim()
        let type = typeRaw.trim().toLowerCase()
        let options: any = null

        const m = type.match(/^select\s*\((.*)\)\s*$/)
        if (m) {
          type = 'select'
          const choices = m[1]
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
          options = { choices }
        } else if (!['text', 'number', 'checkbox'].includes(type)) {
          type = 'text'
        }

        if (!name) return null
        return { name, type, position: i + 1, options }
      })
      .filter(Boolean) as Array<{ name: string; type: string; position: number; options?: any }>
  }

  async function build() {
    setErr('')
    setResult(null)
    if (!baseId) { setErr('Pick a base.'); return }
    if (!tableName.trim()) { setErr('Enter a table name.'); return }

    const fields = parseSpec(spec)
    if (fields.length === 0) { setErr('Add at least one field line.'); return }

    setBusy(true)
    try {
      const res = await fetch('/api/admin/build-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_id: baseId, name: tableName.trim(), fields }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json || json.error) {
        setErr(json?.error ?? `Build failed (${res.status})`)
      } else {
        setResult(json)
      }
    } catch (e: any) {
      setErr(e?.message || 'Build failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin • Build from Spec</h1>

      <label className="block text-sm">Base</label>
      <select
        className="border p-2 rounded w-full"
        value={baseId}
        onChange={e => setBaseId(e.target.value)}
      >
        <option value="">Select a base…</option>
        {bases.map(b => (
          <option key={b.id} value={b.id}>
            {b.name} — {b.id}
          </option>
        ))}
      </select>

      <label className="block text-sm mt-2">Table name</label>
      <input
        className="border p-2 rounded w-full"
        value={tableName}
        onChange={e => setTableName(e.target.value)}
        placeholder="Contacts"
      />

      <label className="block text-sm mt-2">Field spec (one per line: Label:Type)</label>
      <textarea
        className="border p-2 rounded w-full h-40"
        value={spec}
        onChange={e => setSpec(e.target.value)}
        spellCheck={false}
      />

      <div className="flex items-center gap-3">
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={build}
          disabled={busy}
        >
          {busy ? 'Building…' : 'Build'}
        </button>

        {result?.id && (
          <button
            className="border px-3 py-2 rounded"
            onClick={() => window.location.assign(`/${baseId}/tables`)}
            title="Open this base"
          >
            Open base
          </button>
        )}
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}
      {result && (
        <pre className="text-xs bg-gray-50 border p-3 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  )
}
