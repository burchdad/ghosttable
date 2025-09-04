import { useMemo } from 'react';

export interface GridSummary {
  totals: Record<string, number>;
  averages: Record<string, number>;
  counts: Record<string, number>;
}

export function useGridSummary(rows: any[], fields: any[]): GridSummary {
  return useMemo(() => {
    const totals: Record<string, number> = {};
    const averages: Record<string, number> = {};
    const counts: Record<string, number> = {};

    fields.forEach((field: any) => {
      if (field.type === 'number') {
        const nums = rows.map((row: any) => {
          const v = (row.values || []).find((val: any) => val.field_id === field.id)?.value;
          return Number(v);
        }).filter(n => !Number.isNaN(n));
        const sum = nums.reduce((a, b) => a + b, 0);
        totals[field.id] = sum;
        averages[field.id] = nums.length ? sum / nums.length : 0;
        counts[field.id] = nums.length;
      }
    });

    return { totals, averages, counts };
  }, [rows, fields]);
}
