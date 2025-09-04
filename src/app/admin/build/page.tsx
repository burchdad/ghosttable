'use client'
import { useEffect, useState } from 'react'

export default function BuildPage() {
  const [bases, setBases] = useState<any[]>([])
  const [baseId, setBaseId] = useState('')
  const [name, setName] = useState('')
  const [spec, setSpec] = useState(`Name:text
Email:text
Amount:number
Active:checkbox`)
  const [result, setResult] = useState<any>(null)

  useEffect(() => { fetch('/api/bases').then(r=>r.json()).then(setBases) }, [])

  function parseSpec(s: string) {
    // lines like: "Name:text" or "Amount:number" etc.
    return s.split(/\r?\n/).map((line, i) => {
      const t = line.trim()
      if (!t) return null
      const [label, typeRaw] = t.split(':').map(x => (x||'').trim())
      const type = (typeRaw || 'text').toLowerCase()
      return { name: label, type: ['number','checkbox'].includes(type) ? type : 'text', position: i + 1 }
    }).filter(Boolean) as any[]
  }

  async function build() {
    if (!baseId || !name) { alert('Pick base and table name'); return }
    const fields = parseSpec(spec)
    const res = await fetch('/api/admin/build-table', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ base_id: baseId, name, fields })
    })
    const json = await res.json()
    setResult(json)
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin: Build Table</h1>

      <label className="block text-sm">Base</label>
      <select className="border p-2 rounded w-full" value={baseId} onChange={e=>setBaseId(e.target.value)}>
        <option value="">Select a base…</option>
        {bases.map(b => <option key={b.id} value={b.id}>{b.name} — {b.id}</option>)}
      </select>

      <label className="block text-sm">Table name</label>
      <input className="border p-2 rounded w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="Contacts" />

      <label className="block text-sm">Field spec (one per line: Label:Type)</label>
      <textarea className="border p-2 rounded w-full h-40" value={spec} onChange={e=>setSpec(e.target.value)} />

      <button className="bg-black text-white px-4 py-2 rounded" onClick={build}>Build</button>

      {result && (
        <pre className="text-xs bg-gray-50 border p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  )
}
