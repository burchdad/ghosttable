'use client'

import { createClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Presence types
type PresenceUser = { id: string; name: string; avatar?: string; lastActive: number; color?: string };

export default function FormPage() {
  const params = useParams() as Record<string,string>
  const baseId = params.baseId
  const tableId = params.tableId
  const router = useRouter()

  const [fields, setFields] = useState<any[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string>('')

  // Supabase Realtime Presence
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const presenceChannelRef = useRef<any>(null);
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('user_id') || Math.random().toString(36).slice(2)) : '';
  const userName = typeof window !== 'undefined' ? (localStorage.getItem('user_name') || 'Anonymous') : '';
  const userAvatar = typeof window !== 'undefined' ? (localStorage.getItem('user_avatar') || undefined) : undefined;
  const userColor = typeof window !== 'undefined' ? (localStorage.getItem('user_color') || '#3b82f6') : '#3b82f6';
  const supabase = typeof window !== 'undefined' ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) : null;

  useEffect(() => {
    if (!supabase) return;
    const channelBaseId = params?.baseId ?? baseId;
    const channelTableId = params?.tableId ?? tableId;
    const channel = supabase.channel(`presence:${channelBaseId}:${channelTableId}:form`, {
      config: { presence: { key: userId } }
    });
    presenceChannelRef.current = channel;
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now() });
      }
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users: PresenceUser[] = Object.values(state).flat().map((u: any) => ({ ...u }));
      setOnlineUsers(users);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [baseId, tableId, supabase, userId, userName, userAvatar, userColor])

  useEffect(() => {
    if (!tableId) return
    fetch(`/api/fields?table_id=${tableId}`)
      .then(r => r.json())
      .then(a => setFields(Array.isArray(a) ? a : []))
      .catch(() => setFields([]))
  }, [tableId])

  function setVal(fid: string, v: any) {
    setValues(prev => ({ ...prev, [fid]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(''); setDone(false)
    try {
      const res = await fetch('/api/form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId, values })
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json || json.error) { setErr(json?.error || `Submit failed (${res.status})`); return }
      setDone(true); setValues({})
    } catch (e:any) {
      setErr(e?.message || 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      {/* Presence indicator at top of Form */}
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold">Online:</span>
        {onlineUsers.length === 0 ? (
          <span className="text-gray-400">No one online</span>
        ) : (
          onlineUsers.map(u => (
            <span key={u.id} className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: u.color || '#e0e7ff' }}>
              {u.avatar ? <img src={u.avatar} alt="avatar" className="w-5 h-5 rounded-full" /> : <span className="inline-block w-5 h-5 rounded-full bg-gray-300" />}
              <span className="text-xs">{u.name || u.id}</span>
            </span>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Form</h1>
        <button className="border px-3 py-2 rounded" onClick={() => router.push(`/${baseId}/${tableId}`)}>⟵ Back to grid</button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {fields.map((f:any) => {
          const v = values[f.id] ?? (f.type === 'checkbox' ? false : '')
          if (f.type === 'checkbox') {
            return (
              <label key={f.id} className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(v)} onChange={e => setVal(f.id, e.target.checked)} />
                <span>{f.name}</span>
              </label>
            )
          }
          if (f.type === 'select') {
            const choices: string[] = Array.isArray(f.options?.choices) ? f.options.choices : []
            return (
              <div key={f.id} className="grid gap-1">
                <label className="text-sm">{f.name}</label>
                <select className="border p-2 rounded" value={v ?? ''} onChange={e => setVal(f.id, e.target.value)}>
                  <option value=""></option>
                  {choices.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )
          }
          if (f.type === 'multi_select') {
            const choices: string[] = Array.isArray(f.options?.choices) ? f.options.choices : []
            const selected: string[] = Array.isArray(v) ? v : []
            return (
              <div key={f.id} className="grid gap-1">
                <label className="text-sm">{f.name}</label>
                <select className="border p-2 rounded" multiple value={selected}
                        onChange={e => setVal(f.id, Array.from(e.target.selectedOptions).map(o => o.value))}>
                  {choices.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )
          }
          if (f.type === 'date' || f.type === 'datetime') {
            const type = f.type === 'date' ? 'date' : 'datetime-local'
            return (
              <div key={f.id} className="grid gap-1">
                <label className="text-sm">{f.name}</label>
                <input type={type} className="border p-2 rounded" value={v ?? ''} onChange={e => setVal(f.id, e.target.value)} />
              </div>
            )
          }
          // NOTE: attachment/link/formula input skipped for Form MVP
          const inputType = f.type === 'number' ? 'number' : 'text'
          return (
            <div key={f.id} className="grid gap-1">
              <label className="text-sm">{f.name}</label>
              <input type={inputType} className="border p-2 rounded" value={v ?? ''} onChange={e => setVal(f.id, e.target.value)} />
            </div>
          )
        })}

        <button disabled={busy} className="bg-black text-white px-4 py-2 rounded">
          {busy ? 'Submitting…' : 'Submit'}
        </button>
        {done && <div className="text-green-600 text-sm">Saved!</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </form>
    </main>
  )
}
