import React from 'react';
import { VirtualizedTable } from './VirtualizedTable';
import { RecordRow } from './RecordRow';

export function GridTable({
  visibleFields,
  visibleGroups,
  visibleRows,
  dragIndex,
  dragOver,
  setDragIndex,
  setDragOver,
  recordsLoading = false,
  fieldsLoading = false
}: any) {
  // Render header (remains static)
  const renderHeader = (
    <div
      className="flex min-w-full border-b bg-gray-100"
      role="row"
      aria-rowindex={0}
    >
      <div className="border px-2 py-2 w-20 font-semibold" role="columnheader" tabIndex={0} aria-label="Actions">Actions</div>
      {visibleFields.map((field: any, i: number) => (
        <div
          key={field.id}
          className={`border px-4 py-2 text-left relative group flex-1 transition-colors duration-150 ${dragOver === i ? 'outline outline-2 outline-blue-400' : ''}`}
          draggable
          role="columnheader"
          tabIndex={0}
          aria-label={field.name}
          aria-colindex={i + 2}
          onKeyDown={e => {
            if (e.key === 'Enter') setDragIndex(i);
          }}
          onFocus={e => e.currentTarget.classList.add('ring', 'ring-blue-400')}
          onBlur={e => e.currentTarget.classList.remove('ring', 'ring-blue-400')}
          onMouseEnter={e => e.currentTarget.classList.add('bg-blue-50')}
          onMouseLeave={e => e.currentTarget.classList.remove('bg-blue-50')}
          onDragStart={() => setDragIndex(i)}
          onDragOver={e => { e.preventDefault(); setDragOver(i); }}
          onDrop={async () => {/* handle column reorder logic here */}}
          onDragEnd={() => {/* handle drag end logic here */}}
          title="Drag to reorder"
        >
          {field.name}
          {/* Field menu logic can be added here */}
        </div>
      ))}
    </div>
  );

  // Flatten grouped rows if present
  const rows = visibleGroups && typeof visibleGroups.entries === 'function'
    ? Array.from(visibleGroups.values()).flat()
    : Array.isArray(visibleRows) ? visibleRows : [];

  return (
    <div className="min-w-full border overflow-x-auto" role="table" aria-label="Grid Table">
      {renderHeader}
      <VirtualizedTable
        rows={rows}
        rowHeight={40}
        width={800}
        height={600}
        loading={recordsLoading || fieldsLoading}
        renderRow={(record: any, index: number) => (
          <div
            className="flex border-b hover:bg-gray-50 focus-within:bg-blue-50 transition-colors duration-150"
            role="row"
            aria-rowindex={index + 1}
            tabIndex={0}
          >
            <div className="border px-2 py-2 w-20" role="cell" tabIndex={-1} aria-label="Actions">
              <RecordRow key={record.id} record={record} visibleFields={visibleFields} />
            </div>
          </div>
        )}
      />
    </div>
  );
}
