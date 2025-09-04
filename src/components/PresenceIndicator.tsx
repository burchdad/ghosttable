import React from 'react';

export function PresenceIndicator({ onlineUsers, userId }: any) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold">Online:</span>
        {onlineUsers.length === 0 ? (
          <span className="text-gray-400">No one online</span>
        ) : (
          onlineUsers.map((u:any) => (
            <span key={u.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
              {u.avatar ? <img src={u.avatar} alt="avatar" className="w-5 h-5 rounded-full" /> : <span className="inline-block w-5 h-5 rounded-full bg-gray-300" />}
              <span className="text-xs">{u.name || u.id}</span>
            </span>
          ))
        )}
      </div>
      <div style={{ position: 'absolute', pointerEvents: 'none', left: 0, top: 0, width: '100%', height: '100%', zIndex: 50 }}>
        {onlineUsers.filter((u:any) => u.id !== userId && u.cursor).map((u:any) => (
          <div key={u.id} style={{ position: 'absolute', left: u.cursor.x, top: u.cursor.y, transform: 'translate(-50%, -50%)', zIndex: 51 }}>
            <span style={{ background: u.color || '#3b82f6', borderRadius: '50%', width: 16, height: 16, display: 'inline-block', border: '2px solid white' }} />
            <span style={{ fontSize: 10, color: '#222', marginLeft: 4 }}>{u.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
