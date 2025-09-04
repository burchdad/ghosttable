import { useMemo } from 'react';

export function useGridRows({
  records,
  fields,
  filterField,
  filterOp,
  filterVal,
  sortField,
  sortDir,
  groupField,
  searchIds
}: any) {
  // get a record's value for a field
  const getVal = (rec: any, fieldId: string) =>
    (rec.values || []).find((v: any) => v.field_id === fieldId)?.value;

  // filter
  const filteredRows = useMemo(() => {
    return records.filter((row: any) => {
      const value = getVal(row, filterField);
      if (filterOp === 'contains') return (value ?? '').toString().toLowerCase().includes(filterVal.toLowerCase());
      if (filterOp === '=') return value == filterVal;
      if (filterOp === '>') return Number(value) > Number(filterVal);
      if (filterOp === '<') return Number(value) < Number(filterVal);
      return true;
    });
  }, [records, filterField, filterOp, filterVal]);

  // sort
  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aValue = getVal(a, sortField);
      const bValue = getVal(b, sortField);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortDir === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredRows, sortField, sortDir]);

  // grouped rows
  const visibleGroups = useMemo(() => {
    if (!groupField) return null;
    const m = new Map<string, any[]>();
    sortedRows.forEach((r: any) => {
      const raw = getVal(r, groupField);
      const key = raw === undefined || raw === null || raw === '' ? '(blank)' : String(raw);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    });
    return m;
  }, [sortedRows, groupField]);

  // visible rows
  const visibleRows = useMemo(() => {
    if (!searchIds) return sortedRows;
    const set = new Set(searchIds);
    return sortedRows.filter((r: any) => set.has(r.id));
  }, [sortedRows, searchIds]);

  return { visibleGroups, visibleRows };
}
