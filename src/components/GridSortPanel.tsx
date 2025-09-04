import React from 'react';

export function GridSortPanel({ sortField, setSortField, sortDir, setSortDir, fields }: any) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <select value={sortField} onChange={e => setSortField(e.target.value)} className="border px-2 py-1 rounded">
        <option value="">Sort field</option>
        {fields.map((f: any) => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
      <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="border px-2 py-1 rounded">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}
