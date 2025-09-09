import React from 'react';

export function GridFilterPanel({ filterField, setFilterField, filterOp, setFilterOp, filterVal, setFilterVal, fields }: any) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <select value={filterField} onChange={e => setFilterField(e.target.value)} className="border px-2 py-1 rounded">
        <option value="">Filter field</option>
        {fields.map((f: any) => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
      <select value={filterOp} onChange={e => setFilterOp(e.target.value)} className="border px-2 py-1 rounded">
        <option value="contains">contains</option>
        <option value="=">=</option>
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
      </select>
      <input value={filterVal} onChange={e => setFilterVal(e.target.value)} className="border px-2 py-1 rounded" placeholder="Value" />
    </div>
  );
}
