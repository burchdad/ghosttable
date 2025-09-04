'use client'

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Field = { id: string; name: string; type: string; options?: any }
type Cell = { field_id: string; value: any }
type Row = { id: string; values: Cell[] }

// Presence types
type PresenceUser = { id: string; name: string; avatar?: string; lastActive: number; color?: string }

export default function GalleryPage() {
  const params = useParams() as Record<string, string>
  const baseId = params.baseId
  const tableId = params.tableId
  const router = useRouter()

  const [fields, setFields] = useState<Field[]>([])
  const [records, setRecords] = useState<Row[]>([])
  const [attachFieldId, setAttachFieldId] = useState<string>('') // which attachment column drives the card image
  const [titleFieldId, setTitleFieldId] = useState<string>('')   // text field for card title
  const [urlCache, setUrlCache] = useState<Record<string, string>>({}) // path -> signed URL
  const [loading, setLoading] = useState(false)

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
    const channel = supabase.channel(`presence:${channelBaseId}:${channelTableId}:gallery`, {
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
  }, [baseId, tableId, supabase, userId, userName, userAvatar, userColor]);

  useEffect(() => {
    if (!tableId) return
    setLoading(true)
    ;(async () => {
      const f: Field[] = await fetch(`/api/fields?table_id=${tableId}`).then(r=>r.json()).catch(()=>[])
      const r: Row[]   = await fetch(`/api/records?table_id=${tableId}`).then(r=>r.json()).catch(()=>[])
      setFields(Array.isArray(f)?f:[])
      setRecords(Array.isArray(r)?r:[])
      const defAttach = (f||[]).find(x => x.type === 'attachment')
      const defTitle  = (f||[]).find(x => x.type === 'text')
      if (defAttach) setAttachFieldId(defAttach.id)
      if (defTitle)  setTitleFieldId(defTitle.id)
      setLoading(false)
    })()
  }, [tableId])

  const getVal = (row: Row, fid: string) =>
    (row.values || []).find(v => v.field_id === fid)?.value

  async function signedUrl(path: string, seconds = 120) {
    if (urlCache[path]) return urlCache[path]
    const q = new URLSearchParams({ path, expiresIn: String(seconds) })
    const { url } = await fetch(`/api/attachments/url?${q.toString()}`).then(r=>r.json())
    if (url) setUrlCache(prev => ({ ...prev, [path]: url }))
    return url
  }

  const cards = useMemo(() => {
    if (!attachFieldId) return []
    return records.map(r => {
      const files = getVal(r, attachFieldId)
      const first = (Array.isArray(files) ? files[0] : null)
      const title = String(getVal(r, titleFieldId) ?? r.id)
      return { record: r, file: first, title }
    })
  }, [records, attachFieldId, titleFieldId])

  if (loading) return <main className="max-w-6xl mx-auto p-6">Loading…</main>

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      {/* Presence indicator at top of Gallery */}
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
        <h1 className="text-2xl font-bold">Gallery</h1>
        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" onClick={() => router.push(`/${baseId}/${tableId}`)}>⟵ Back to grid</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Attachment field:</label>
        <select className="border p-1 rounded" value={attachFieldId} onChange={e=>setAttachFieldId(e.target.value)}>
          {fields.filter(f => f.type === 'attachment').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <label className="text-sm">Title field:</label>
        <select className="border p-1 rounded" value={titleFieldId} onChange={e=>setTitleFieldId(e.target.value)}>
          {fields.filter(f => f.type === 'text').map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(({ record, file, title }) => {
          return (
            <div key={record.id} className="border rounded overflow-hidden bg-white shadow-sm hover:shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {file ? (
                  <img
                    src={urlCache[file.path] || ''}
                    onLoad={(e) => {
                      if (!urlCache[file.path]) {
                        // lazy create signed URL
                        signedUrl(file.path)
                      }
                    }}
                    alt={file.name || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-500">No image</div>
                )}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate" title={title}>{title}</div>
                <div className="text-xs text-gray-500 truncate" title={file?.name || ''}>
                  {file?.name || ''}
                </div>
                <div className="mt-2 flex gap-2">
                  {file && (
                    <button
                      className="border px-2 py-1 rounded text-xs"
                      onClick={async () => {
                        const url = await signedUrl(file.path, 120)
                        if (url) window.open(url, '_blank')
                      }}
                    >
                      Open
                    </button>
                  )}
                  <button
                    className="border px-2 py-1 rounded text-xs"
                    onClick={() => router.push(`/${baseId}/${tableId}`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
