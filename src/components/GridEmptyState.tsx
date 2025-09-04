import React from 'react';

export function GridEmptyState({ message = 'No records found.' }: { message?: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2"><circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2" /><path d="M8 12h8M8 16h8" stroke="#ccc" strokeWidth="2" strokeLinecap="round" /></svg>
      <div>{message}</div>
    </div>
  );
}
