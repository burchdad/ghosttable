import React from 'react';

export function ColumnSettings({ fields, views, activeView, setViews, setActiveView, showColsPicker, setShowColsPicker }: any) {
  // Visible columns picker UI
  return (
    <div className="mt-2 border rounded p-3 bg-white shadow max-w-xl mb-4">
      <div className="text-sm font-medium mb-2">Visible columns</div>
      <div className="grid sm:grid-cols-2 gap-2">
        {fields.map((f:any) => {
          const current = views.find((v:any) => v.id === activeView);
          const vis = Array.isArray(current?.config?.visibleFields)
            ? current.config.visibleFields as string[]
            : fields.map((x:any)=>x.id);
          const checked = vis.includes(f.id);
          return (
            <label key={f.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={async e => {
                  const next = e.target.checked
                    ? Array.from(new Set([...vis, f.id]))
                    : vis.filter((id:string) => id !== f.id);
                  // persist to view
                  // ...existing code for PATCH request...
                }}
              />
              {f.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}
