import React from 'react';
export function ErrorState({ error }: { error: string }) {
  return <div className="text-red-600 p-4">Error: {error}</div>;
}
