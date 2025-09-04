import React from 'react';

export function GridBulkActions({ selectedIds, onDeleteSelected, onDuplicateSelected, clearSelection }: any) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <span className="font-semibold">Bulk actions:</span>
      <button className="bg-red-600 text-white px-3 py-1 rounded" disabled={selectedIds.length === 0} onClick={onDeleteSelected}>
        Delete Selected
      </button>
      <button className="bg-gray-600 text-white px-3 py-1 rounded" disabled={selectedIds.length === 0} onClick={onDuplicateSelected}>
        Duplicate Selected
      </button>
      <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={selectedIds.length === 0} onClick={clearSelection}>
        Clear Selection
      </button>
    </div>
  );
}
