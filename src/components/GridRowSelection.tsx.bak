import React from 'react';

export function GridRowSelection({ selectedIds, onSelect, rows, isAllSelected, onSelectAll, onDeselectAll }: any) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <span className="font-semibold">Selected: {selectedIds.length}</span>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={e => e.target.checked ? onSelectAll() : onDeselectAll()}
        />
        <span>All</span>
      </label>
      {rows.map((row: any) => (
        <label key={row.id} className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={e => onSelect(row.id, e.target.checked)}
          />
          {row.id}
        </label>
      ))}
    </div>
  );
}
