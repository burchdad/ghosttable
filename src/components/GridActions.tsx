import React from 'react';

export function GridActions({ record, onEdit, onDelete, onDuplicate }: any) {
  return (
    <div className="flex gap-2">
      <button className="text-blue-600" onClick={() => onEdit(record)}>Edit</button>
      <button className="text-red-600" onClick={() => onDelete(record)}>Delete</button>
      <button className="text-gray-600" onClick={() => onDuplicate(record)}>Duplicate</button>
    </div>
  );
}
