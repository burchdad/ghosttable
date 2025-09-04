'use client'

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Field = { id: string; name: string; type: string; options?: any }
type Cell = { field_id: string; value: any }
type Row = { id: string; values: Cell[] }

// Presence types
type PresenceUser = { id: string; name: string; avatar?: string; lastActive: number; color?: string; draggingId?: string };

export default function CalendarPage() {
  const params = useParams() as Record<string, string>
  const baseId = params.baseId
  const tableId = params.tableId
  const router = useRouter()

  // data
  const [fields, setFields] = useState<Field[]>([])
  const [records, setRecords] = useState<Row[]>([])
  // calendar state
  const [dateFieldId, setDateFieldId] = useState<string>('')
  const [labelFieldId, setLabelFieldId] = useState<string>('') // what text shows on cards
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [draggingId, setDraggingId] = useState<string>('')

  // Supabase Realtime Presence
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const presenceChannelRef = useRef<any>(null);
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('user_id') || Math.random().toString(36).slice(2)) : '';
  const userName = typeof window !== 'undefined' ? (localStorage.getItem('user_name') || 'Anonymous') : '';
  const userAvatar = typeof window !== 'undefined' ? (localStorage.getItem('user_avatar') || undefined) : undefined;
  const userColor = typeof window !== 'undefined' ? (localStorage.getItem('user_color') || '#3b82f6') : '#3b82f6';
  const supabase = typeof window !== 'undefined' ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) : null;

  // load fields + records
  useEffect(() => {
    if (!tableId) return
    ;(async () => {
      const f: Field[] = await fetch(`/api/fields?table_id=${tableId}`).then(r => r.json()).catch(() => [])
      const r: Row[] = await fetch(`/api/records?table_id=${tableId}`).then(r => r.json()).catch(() => [])
      setFields(Array.isArray(f) ? f : [])
      setRecords(Array.isArray(r) ? r : [])
      // defaults
      const dateF = f.find(x => x.type === 'date') || f.find(x => x.type === 'datetime')
      const textF = f.find(x => x.type === 'text')
      if (dateF) setDateFieldId(dateF.id)
      if (textF) setLabelFieldId(textF.id)
    })()
  }, [tableId])

  useEffect(() => {
    if (!supabase) return;
    const channelBaseId = params?.baseId ?? baseId;
    const channelTableId = params?.tableId ?? tableId;
    const channel = supabase.channel(`presence:${channelBaseId}:${channelTableId}:calendar`, {
      config: { presence: { key: userId } }
    });
    presenceChannelRef.current = channel;
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now(), draggingId });
      }
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users: PresenceUser[] = Object.values(state).flat().map((u: any) => ({ ...u }));
      setOnlineUsers(users);
    });
    channel.on('broadcast', { event: 'drag' }, payload => {
      channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now(), draggingId: payload?.draggingId });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [baseId, tableId, supabase, userId, userName, userAvatar, userColor, draggingId]);

  useEffect(() => {
    if (presenceChannelRef.current) {
      presenceChannelRef.current.send({ type: 'broadcast', event: 'drag', payload: { draggingId } });
    }
  }, [draggingId]);

  const getVal = (row: Row, fid: string) =>
    (row.values || []).find(v => v.field_id === fid)?.value

  // derive days for current month (include leading/trailing to fill weeks)
  const days = useMemo(() => {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const first = new Date(y, m, 1)
    const start = new Date(first)
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)) // week starts Mon; change to 0 for Sun-start
    const out: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      out.push(d)
    }
    return out
  }, [cursor])

  // group records by YYYY-MM-DD (for chosen date field)
  const recsByDay = useMemo(() => {
    const map: Record<string, Row[]> = {}
    if (!dateFieldId) return map
    for (const r of records) {
      const raw = getVal(r, dateFieldId)
      const key = normalizeToDateKey(raw) // 'YYYY-MM-DD' or '' if none
      if (!key) continue
      map[key] ??= []
      map[key].push(r)
    }
    return map
  }, [records, dateFieldId])

  // helpers
  function dayKey(d: Date) {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
  }
  function normalizeToDateKey(v: any): string {
    if (!v) return ''
    // handle 'YYYY-MM-DD' or ISO datetime
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
    const d = new Date(s)
    if (Number.isNaN(+d)) return ''
    return dayKey(d)
  }

  async function saveCell(record_id: string, field_id: string, value: any) {
    const res = await fetch('/api/cells', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record_id, field_id, value })
    })
    const saved = await res.json().catch(() => null)
    if (!res.ok || !saved || saved.error) {
      console.error('Cell save failed:', saved)
      return
    }
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== record_id) return r
        const exists = (r.values || []).some(v => v.field_id === field_id)
        return exists
          ? { ...r, values: r.values.map(v => (v.field_id === field_id ? saved : v)) }
          : { ...r, values: [...(r.values || []), saved] }
      })
    )
  }

  function onDragStart(e: React.DragEvent, recordId: string) {
    setDraggingId(recordId)
    e.dataTransfer.setData('text/plain', recordId)
  }
  async function onDrop(e: React.DragEvent, targetDate: Date) {
    e.preventDefault()
    if (!dateFieldId) return
    const id = draggingId || e.dataTransfer.getData('text/plain')
    setDraggingId('')
    if (!id) return
    const day = dayKey(targetDate)
    const field = fields.find(f => f.id === dateFieldId)
    const value = field?.type === 'datetime' ? `${day}T00:00:00` : day
    await saveCell(id, dateFieldId, value)
  }

  return (
    <main className="max-w-[1200px] mx-auto p-6 space-y-4">
      {/* Presence indicator at top of Calendar */}
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
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" onClick={() => router.push(`/${baseId}/${tableId}`)}>⟵ Back to grid</button>
          <button className="border px-3 py-2 rounded" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}>◀ Prev</button>
          <div className="px-3 py-2">{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
          <button className="border px-3 py-2 rounded" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}>Next ▶</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Date field:</label>
        <select className="border p-1 rounded" value={dateFieldId} onChange={e => setDateFieldId(e.target.value)}>
          {fields.filter(f => f.type === 'date' || f.type === 'datetime').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <label className="text-sm">Card label:</label>
        <select className="border p-1 rounded" value={labelFieldId} onChange={e => setLabelFieldId(e.target.value)}>
          {fields.filter(f => f.type === 'text').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Week headers (Mon–Sun) */}
      <div className="grid grid-cols-7 text-xs text-gray-500 px-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const key = dayKey(d);
          const isOtherMonth = d.getMonth() !== cursor.getMonth();
          const dayItems = (recsByDay[key] || []) as Row[];
          // Count users dragging into this day
          const draggingUsers = onlineUsers.filter(u => {
            if (!u.draggingId) return false;
            const rec = records.find(r => r.id === u.draggingId);
            const raw = rec ? getVal(rec, dateFieldId) : null;
            return normalizeToDateKey(raw) === key;
          });
          return (
            <div key={key + idx} className={`min-h-[120px] border rounded p-2 flex flex-col gap-2 ${isOtherMonth ? 'bg-gray-50' : 'bg-white'}`} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, d)}>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                {d.getDate()}
                {draggingUsers.length > 0 && (
                  <span className="flex gap-1 items-center ml-1">
                    {draggingUsers.map(u => (
                      <span key={u.id} className="w-3 h-3 rounded-full" style={{ background: u.color || '#3b82f6' }} title={u.name} />
                    ))}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {dayItems.map(r => {
                  const title = String(getVal(r, labelFieldId) ?? r.id)
                  return (
                    <div
                      key={r.id}
                      className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs cursor-grab truncate"
                      draggable
                      onDragStart={e => onDragStart(e, r.id)}
                      title="Drag to another day"
                    >
                      {title}
                    </div>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  )
}
