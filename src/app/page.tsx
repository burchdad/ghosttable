'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'


type Base = { id: string; name: string; organization_id: string }
type Org = { id: string; name: string }


export default function HomePage() {
const [bases, setBases] = useState<Base[]>([])
const [orgs, setOrgs] = useState<Org[]>([])
const [name, setName] = useState('')
const [orgId, setOrgId] = useState('')
const [open, setOpen] = useState(false)
const menuRef = useRef<HTMLDivElement | null>(null)
const router = useRouter()


useEffect(() => {
fetch('/api/bases').then(r => r.json()).then(setBases)
fetch('/api/organizations').then(r => r.json()).then(setOrgs)
}, [])


useEffect(() => {
function onDocClick(e: MouseEvent) {
if (!menuRef.current) return
if (!menuRef.current.contains(e.target as Node)) setOpen(false)
}
document.addEventListener('click', onDocClick)
return () => document.removeEventListener('click', onDocClick)
}, [])


async function handleCreateBase(e?: React.FormEvent) {
e?.preventDefault()
if (!name || !orgId) return
const res = await fetch('/api/bases', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name, organization_id: orgId })
})
if (!res.ok) {
const err = await res.json().catch(() => ({}))
alert(`Create failed${err?.error ? `: ${err.error}` : ''}`)
return
}
const created: Base = await res.json()
setBases(prev => [...prev, created])
setName('')
setOrgId('')
}


async function quickCreateOrg() {
const label = `Org ${new Date().toLocaleString()}`
const res = await fetch('/api/organizations', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name: label })
})
const created: Org = await res.json()
setOrgs(prev => [...prev, created])
setOrgId(created.id)
setOpen(false)
}

const pickedOrgName = useMemo(() => orgs.find(o => o.id === orgId)?.name ?? '', [orgs, orgId])


return (
<main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
<section>
<h1 className="text-3xl font-bold mb-6">Bases</h1>
<form onSubmit={handleCreateBase} className="mb-4 grid grid-cols-1 gap-3">
<input
className="border p-2 rounded"
placeholder="Base name"
value={name}
onChange={e => setName(e.target.value)}
/>


<div className="relative flex items-center gap-2">
<input
className="border p-2 rounded flex-1"
placeholder="Organization ID"
value={orgId}
onChange={e => setOrgId(e.target.value)}
/>
{/* 3-dot org picker */}
<div ref={menuRef} className="relative">
<button type="button" aria-label="Pick organization" onClick={() => setOpen(v => !v)} className="border rounded px-2 py-1">
⋯
</button>
{open && (
<div className="absolute right-0 top-full mt-2 w-80 max-h-72 overflow-auto rounded border bg-white shadow z-10">
<div className="p-2 border-b text-sm flex items-center justify-between">
<span className="font-medium">Organizations</span>
<button type="button" className="text-xs underline" onClick={quickCreateOrg}>Quick-create</button>
</div>
<ul className="divide-y">
{orgs.length === 0 && (
<li className="p-3 text-sm text-gray-500">No organizations yet.</li>
)}
{orgs.map(o => (
<li key={o.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => { setOrgId(o.id); setOpen(false) }}>
<div className="text-sm font-medium">{o.name}</div>
<div className="text-xs text-gray-500">{o.id}</div>
</li>
))}
</ul>
</div>
)}
</div>
</div>


<div className="text-xs text-gray-600">
{pickedOrgName && (
<span>Selected org: <span className="font-medium">{pickedOrgName}</span></span>
)}
</div>


<button type="submit" className="bg-black text-white px-4 py-2 rounded w-fit">Create Base</button>
</form>


<ul className="space-y-3">
{bases.map(b => (
<li key={b.id} className="border rounded p-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/${b.id}/tables`)}>
<div className="font-semibold">{b.name}</div>
<div className="text-sm text-gray-500">Org: {b.organization_id}</div>
</li>
))}
{bases.length === 0 && <li className="text-sm text-gray-500">No bases yet.</li>}
</ul>
</section>
</main>
)
}
  