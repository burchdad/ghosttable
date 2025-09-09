import React from 'react';
export function Notification({ message, type = 'info' }: { message: string; type?: 'info'|'error'|'success' }) {
  const color = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';
  return <div className={`fixed bottom-4 right-4 px-4 py-2 rounded text-white shadow-lg ${color}`}>{message}</div>;
}
