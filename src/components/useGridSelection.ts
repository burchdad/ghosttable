import { useState, useCallback } from 'react';

export interface GridSelection {
  selectedRowIds: Set<string>;
  isAllSelected: boolean;
  selectRow: (rowId: string) => void;
  deselectRow: (rowId: string) => void;
  toggleRow: (rowId: string) => void;
  clearSelection: () => void;
  selectAll: (rowIds: string[]) => void;
  deselectAll: () => void;
}

export function useGridSelection(initialRowIds: string[] = []): GridSelection {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const isAllSelected = initialRowIds.length > 0 && selectedRowIds.size === initialRowIds.length;

  const selectRow = useCallback((rowId: string) => {
    setSelectedRowIds(prev => new Set(prev).add(rowId));
  }, []);

  const deselectRow = useCallback((rowId: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  }, []);

  const toggleRow = useCallback((rowId: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  const selectAll = useCallback((rowIds: string[]) => {
    setSelectedRowIds(new Set(rowIds));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  return {
    selectedRowIds,
    isAllSelected,
    selectRow,
    deselectRow,
    toggleRow,
    clearSelection,
    selectAll,
    deselectAll,
  };
}
