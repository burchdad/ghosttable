'use client'
import { useEffect, useMemo, useState } from 'react'

export default function PublicSharePage({ params }: { params: { token: string } }) {
  const { token } = params
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    fetch(`/api/share/${token}`).then(r => r.json()).then(setData).catch(()=>setErr('Failed'))
  }, [token])

  const fields = data?.fields || []
  const rows = data?.rows || []

  // apply saved view config (very basic: filter/sort/visibility if present)
  const visibleFieldIds: string[] = Array.isArray(data?.view?.config?.visibleFields)
    ? data.view.config.visibleFields
    : fields.map((f:any)=>f.id)
  const visFields = fields.filter((f:any)=>visibleFieldIds.includes(f.id))

  const esc = (s:any) => `"${String(s ?? '').replace(/"/g,'""')}"`
  function downloadCSV() {
    const header = ['record_id', ...visFields.map((f:any)=>f.name)]
    const csv = [header.map(esc).join(',')].concat(
      rows.map((r:any)=> {
        const line = [r.id, ...visFields.map((f:any) => {
          const cell = (r.values||[]).find((v:any)=>v.field_id===f.id)?.value
          const out = typeof cell === 'object' ? JSON.stringify(cell) : (cell ?? '')
          return esc(out)
        })]
        return line.join(',')
      })
    ).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `share_${token}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (err) return <main className="max-w-4xl mx-auto p-6">Error</main>
  if (!data) return <main className="max-w-4xl mx-auto p-6">Loading…</main>

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shared view</h1>
        {data.allow_download && (
          <button className="border px-3 py-2 rounded" onClick={downloadCSV}>Download CSV</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              {visFields.map((f:any)=>(
                <th key={f.id} className="border px-4 py-2 text-left bg-gray-50">{f.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any) => (
              <tr key={r.id}>
                {visFields.map((f:any)=> {
                  const v = (r.values||[]).find((x:any)=>x.field_id===f.id)?.value
                  const s = typeof v === 'object' ? JSON.stringify(v) : (v ?? '')
                  return <td key={f.id} className="border px-4 py-2">{String(s)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
