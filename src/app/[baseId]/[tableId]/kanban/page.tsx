'use client'

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Field = { id: string; name: string; type: string; options?: any }
type RecordRow = { id: string; values: Array<{ field_id: string; value: any }> }

// Presence types
type PresenceUser = { id: string; name: string; avatar?: string; lastActive: number; color?: string; draggingId?: string };

export default function KanbanPage() {
  const params = useParams() as Record<string, string>
  const baseId = params.baseId
  const tableId = params.tableId
  const router = useRouter()

  const [fields, setFields] = useState<Field[]>([])
  const [records, setRecords] = useState<RecordRow[]>([])
  const [boardFieldId, setBoardFieldId] = useState<string>('')   // select field used for columns
  const [labelFieldId, setLabelFieldId] = useState<string>('')   // text shown on cards
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
      const f = await fetch(`/api/fields?table_id=${tableId}`).then(r => r.json()).catch(() => [])
      const r = await fetch(`/api/records?table_id=${tableId}`).then(r => r.json()).catch(() => [])
      setFields(Array.isArray(f) ? f : [])
      setRecords(Array.isArray(r) ? r : [])
      // defaults
      const sel = (Array.isArray(f) ? f : []).find((x: Field) => x.type === 'select')
      const txt = (Array.isArray(f) ? f : []).find((x: Field) => x.type === 'text')
      setBoardFieldId(sel?.id || '')
      setLabelFieldId(txt?.id || '')
    })()
  }, [tableId])

  // Supabase presence logic
  useEffect(() => {
    if (!supabase) return;
  const channelBaseId = params?.baseId ?? baseId;
  const channelTableId = params?.tableId ?? tableId;
  const channel = supabase.channel(`presence:${channelBaseId}:${channelTableId}:kanban`, {
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
    // Broadcast draggingId changes
    channel.on('broadcast', { event: 'drag' }, payload => {
      channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now(), draggingId: payload?.draggingId });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [baseId, tableId, supabase, userId, userName, userAvatar, userColor, draggingId]);

  useEffect(() => {
    // Broadcast draggingId on change
    if (presenceChannelRef.current) {
      presenceChannelRef.current.send({ type: 'broadcast', event: 'drag', payload: { draggingId } });
    }
  }, [draggingId]);

  // helpers
  const getVal = (rec: RecordRow, fieldId: string) =>
    (rec.values || []).find(v => v.field_id === fieldId)?.value

  const boardField = useMemo(
    () => fields.find(f => f.id === boardFieldId),
    [fields, boardFieldId]
  )

  const choices: string[] = useMemo(() => {
    const arr = boardField?.options?.choices
    return Array.isArray(arr) ? arr : []
  }, [boardField])

  // build columns (blank + choices)
  const columns = useMemo(() => {
    const map: Record<string, RecordRow[]> = {}
    const labels = ['(blank)', ...choices]
    labels.forEach(l => (map[l] = []))
    records.forEach(r => {
      const v = getVal(r, boardFieldId)
      const key = (v == null || v === '') ? '(blank)' : String(v)
      if (!map[key]) map[key] = []
      map[key].push(r)
    })
    return { labels: ['(blank)', ...choices], map }
  }, [records, boardFieldId, choices])

  async function saveCell(record_id: string, field_id: string, raw: any) {
    // persist to server
    const res = await fetch('/api/cells', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record_id, field_id, value: raw })
    })
    const saved = await res.json().catch(() => null)
    if (!res.ok || !saved || saved.error) {
      console.error('Cell save failed:', saved)
      return
    }
    // local merge
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

  async function onDrop(e: React.DragEvent, columnLabel: string) {
    e.preventDefault()
    const id = draggingId || e.dataTransfer.getData('text/plain')
    setDraggingId('')
    if (!id || !boardFieldId) return
    const newVal = columnLabel === '(blank)' ? null : columnLabel
    await saveCell(id, boardFieldId, newVal)
  }

  if (!boardField) {
    return (
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <p className="text-sm text-gray-600">
          This view needs a <b>single-select</b> field. Create one in the grid, then come back.
        </p>
        <button className="border px-3 py-2 rounded" onClick={() => router.push(`/${baseId}/${tableId}`)}>
          Back to grid
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-[1400px] mx-auto p-6 space-y-4">
      {/* Presence indicator at top of Kanban */}
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

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <button className="border px-3 py-2 rounded" onClick={() => router.push(`/${baseId}/${tableId}`)}>
          ⟵ Back to grid
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Board field:</label>
        <select
          className="border p-1 rounded"
          value={boardFieldId}
          onChange={e => setBoardFieldId(e.target.value)}
        >
          {fields.filter(f => f.type === 'select').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <label className="text-sm">Card label:</label>
        <select
          className="border p-1 rounded"
          value={labelFieldId}
          onChange={e => setLabelFieldId(e.target.value)}
        >
          {fields.filter(f => f.type === 'text').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Board */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
        {columns.labels.map(label => {
          const items = columns.map[label] || [];
          // Count users dragging into this column
          const draggingUsers = onlineUsers.filter(u => {
            if (!u.draggingId) return false;
            const rec = records.find(r => r.id === u.draggingId);
            const v = rec ? getVal(rec, boardFieldId) : null;
            return (v == null && label === '(blank)') || (v === label);
          });
          return (
            <div key={label} className="flex flex-col bg-gray-50 border rounded min-h-[300px]" onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, label)}>
              <div className="px-3 py-2 border-b bg-white rounded-t flex items-center justify-between">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-500">{items.length} cards</div>
                {draggingUsers.length > 0 && (
                  <div className="flex gap-1 items-center">
                    {draggingUsers.map(u => (
                      <span key={u.id} className="w-3 h-3 rounded-full" style={{ background: u.color || '#3b82f6' }} title={u.name} />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 space-y-3 overflow-auto">
                {items.map(r => {
                  const title = String(
                    (r.values || []).find(v => v.field_id === labelFieldId)?.value ?? r.id
                  )
                  return (
                    <div
                      key={r.id}
                      className="bg-white border rounded p-3 cursor-grab shadow-sm hover:shadow"
                      draggable
                      onDragStart={e => onDragStart(e, r.id)}
                      title={`Drag to another column`}
                    >
                      <div className="text-sm font-medium truncate">{title}</div>
                      {/* you can render more fields inside the card if you want */}
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
