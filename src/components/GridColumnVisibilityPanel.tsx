import React from 'react';

export function GridColumnVisibilityPanel({ fields, visibleFieldIds, setVisibleFieldIds }: any) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {fields.map((f: any) => (
        <label key={f.id} className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleFieldIds.includes(f.id)}
            onChange={e => {
              if (e.target.checked) setVisibleFieldIds((prev: string[]) => [...prev, f.id]);
              else setVisibleFieldIds((prev: string[]) => prev.filter(id => id !== f.id));
            }}
          />
          {f.name}
        </label>
      ))}
    </div>
  );
}
