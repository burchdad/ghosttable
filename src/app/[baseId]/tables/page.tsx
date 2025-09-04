'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'


export default function TablesPage() {
const params = useParams()
const baseId = typeof params?.baseId === 'string' ? params.baseId : Array.isArray(params?.baseId) ? params.baseId[0] : ''
const [tables, setTables] = useState<any[]>([])
const [name, setName] = useState('')
const router = useRouter()


useEffect(() => {
fetch(`/api/tables?base_id=${baseId}`)
.then(res => res.json())
.then(setTables)
}, [baseId])


async function handleCreateTable() {
const res = await fetch('/api/tables', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name, base_id: baseId })
})
const newTable = await res.json()
setTables(prev => [...prev, newTable])
setName('')
}


return (
<main className="max-w-3xl mx-auto py-10 px-4">
<h1 className="text-2xl font-bold mb-6">Tables in Base {baseId}</h1>


<div className="mb-8 space-y-2">
<input
className="border p-2 w-full rounded"
placeholder="Table name"
value={name}
onChange={e => setName(e.target.value)}
/>
<button
className="bg-black text-white px-4 py-2 rounded"
onClick={handleCreateTable}
>
Create Table
</button>
</div>


<ul className="space-y-4">
{tables.map(table => (
<li
key={table.id}
className="border p-4 rounded cursor-pointer hover:bg-gray-50"
onClick={() => router.push(`/${baseId}/${table.id}`)}
>
<div className="font-semibold">{table.name}</div>
</li>
))}
</ul>
</main>
)
}
