import React from 'react';

export function GridSummary({ displayNumericFields, visibleFieldIds, items }: any) {
  return (
    <tfoot>
      <tr>
        {displayNumericFields.filter((f: any) => visibleFieldIds.includes(f.id)).map((f: any) => {
          const sum = Array.isArray(items) ? items.reduce((acc: number, r: any) => {
            const v = (r.values || []).find((v:any) => v.field_id === f.id)?.value;
            const n = Number(v);
            return Number.isNaN(n) ? acc : acc + n;
          }, 0) : 0;
          return (
            <td key={f.id} className="border px-4 py-2 font-bold text-right">
              {sum}
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}
