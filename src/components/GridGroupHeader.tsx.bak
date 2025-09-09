import React from 'react';

export function GridGroupHeader({ groupKey, groupRecords, onToggle, expanded }: any) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={100} className="px-4 py-2 font-semibold">
        <button onClick={onToggle} className="mr-2">
          {expanded ? '▼' : '▶'}
        </button>
        {groupKey} <span className="text-xs text-gray-500">({groupRecords.length} records)</span>
      </td>
    </tr>
  );
}
