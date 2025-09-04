'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js';
import { supabaseBrowser } from '../../../../lib/supabase-browser'
import * as Sentry from '@sentry/react';

import RecordDrawer from '@/components/RecordDrawer';
import { GridTable } from '../../../components/GridTable';
import { FieldCreator } from '../../../components/FieldCreator';
import { ViewControls } from '../../../components/ViewControls';
import { PresenceIndicator } from '../../../components/PresenceIndicator';
import { GridToolbar } from '../../../components/GridToolbar';
import { GridSummary } from '../../../components/GridSummary';
import { GridGroupHeader } from '../../../components/GridGroupHeader';
import { GridEmptyState } from '../../../components/GridEmptyState';
import { GridActions } from '../../../components/GridActions';
import { GridPagination } from '../../../components/GridPagination';
import { GridFilterPanel } from '../../../components/GridFilterPanel';
import { GridSortPanel } from '../../../components/GridSortPanel';
import { GridRowSelection } from '../../../components/GridRowSelection';
import { GridBulkActions } from '../../../components/GridBulkActions';
import { GridColumnResizer } from '../../../components/GridColumnResizer';
import { GridColumnVisibilityPanel } from '../../../components/GridColumnVisibilityPanel';
import { useGridStore } from '../../../components/useGridStore';
import { Cell } from '../../../components/Cell';
import { Notification } from '../../../components/Notification';
import { UndoRedo } from '../../../components/UndoRedo';
import { t } from '../../../components/i18n';
import { GridContext } from '@/components/GridContext';

// Placeholder components for loading/error
const LoadingState = () => <div>Loading...</div>;
const ErrorState = ({ error }: { error: any }) => <div>Error: {error?.toString()}</div>;

type PresenceUser = {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  lastActive?: number;
  cursor?: any;
};

function GridPage() {
  // Column drag-and-drop state
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dragOver, setDragOver] = React.useState<number | null>(null);
  // Zustand: grid/UI/user/session state and actions
  const {
    fields, setFields,
    records, setRecords,
    views, setViews,
    activeView, setActiveView,
    baseId, tableId,
    filterField, setFilterField,
    filterVal, setFilterVal,
    filterOp, setFilterOp,
    sortField, setSortField,
    sortDir, setSortDir,
    groupField, setGroupField,
    q, setQ,
    searchIds, setSearchIds,
    page, setPage,
    pageSize, setPageSize,
    showColsPicker, setShowColsPicker,
    linkCache, setLinkCache,
    recordsLoading, fieldsLoading, viewsLoading,
    recordsError, fieldsError, viewsError,
    userId, userName, userAvatar, userColor,
    supabase, presenceChannelRef, cursor, setCursor, setSession,
    selection, setSelection,
  } = useGridStore();

  // Next.js params
  const params = useParams();

  // --- Computed variables ---
  const getVal = (rec: any, fieldId: string) => (rec.values || []).find((v: any) => v.field_id === fieldId)?.value;
  const applyConfig = (src: any[], filterField: string, filterVal: string, filterOp: string, sortField: string, sortDir: string) => {
    let out = src.slice();
    if (filterField && filterVal) {
      out = out.filter(r => {
        const v = (r.values || []).find((x:any) => x.field_id === filterField)?.value;
        if (filterOp === 'contains') return (String(v ?? '')).toLowerCase().includes(filterVal.toLowerCase());
        if (filterOp === '=')        return v == filterVal;
        if (filterOp === '>')        return Number(v) > Number(filterVal);
        if (filterOp === '<')        return Number(v) < Number(filterVal);
        return true;
      });
    }
    if (sortField) {
      out.sort((a,b) => {
        const av = (a.values || []).find((x:any)=>x.field_id===sortField)?.value;
        const bv = (b.values || []).find((x:any)=>x.field_id===sortField)?.value;
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (sortDir === 'asc') return av > bv ? 1 : av < bv ? -1 : 0;
        return av < bv ? 1 : av > bv ? -1 : 0;
      });
    }
    return out;
  };

  // Local UI state (not in Zustand)
  const [onlineUsers, setOnlineUsers] = React.useState<any[]>([]);
  const [openFieldMenu, setOpenFieldMenu] = React.useState<string | null>(null);
  const [tablesInBase, setTablesInBase] = React.useState<any[]>([]);
  const [targetFields, setTargetFields] = React.useState<any[]>([]);
  const [targetFieldsForLookup, setTargetFieldsForLookup] = React.useState<any[]>([]);
  const [fieldName, setFieldName] = React.useState('');
  const [fieldType, setFieldType] = React.useState('text');
  const [linkTargetTable, setLinkTargetTable] = React.useState('');
  const [linkLabelField, setLinkLabelField] = React.useState('');
  const [linkSourceField, setLinkSourceField] = React.useState('');
  const [lookupTargetField, setLookupTargetField] = React.useState('');
  const [rollupAgg, setRollupAgg] = React.useState('');
  const [rollupSep, setRollupSep] = React.useState(', ');
  const [drawerRec, setDrawerRec] = React.useState<any>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<{ type: string; message: string } | null>(null);
  // Activity log state
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  // --- Computed variables ---
  const sortedRows = useMemo(() => applyConfig(records, filterField, filterVal, filterOp, sortField, sortDir), [records, filterField, filterVal, filterOp, sortField, sortDir]);
  const groupedRows = useMemo(() => {
    if (!groupField) return sortedRows;
    if (!Array.isArray(sortedRows)) return {};
    return sortedRows.reduce((acc: any, row: any) => {
      const groupValue = getVal(row, groupField) || '(blank)';
      if (!acc[groupValue]) acc[groupValue] = [];
      acc[groupValue].push(row);
      return acc;
    }, {});
  }, [sortedRows, groupField]);
  const finalRows = useMemo(() => {
    if (!Object.keys(groupedRows).length) return groupedRows;
    const flat: any[] = [];
    Object.values(groupedRows).forEach((group: any) => {
      flat.push(...group);
    });
    return flat;
  }, [groupedRows]);
  const searchedRows = useMemo(() => {
    if (!searchIds?.length) return finalRows;
    const idSet = new Set(searchIds);
    return finalRows.filter((row: any) => idSet.has(row.id));
  }, [finalRows, searchIds]);
  const displayRows = useMemo(() => searchedRows.slice(0, pageSize), [searchedRows, pageSize]);
  const currentView = views.find((v:any) => v.id === activeView);
  const [visibleFieldIds, setVisibleFieldIds] = React.useState<string[]>(
    Array.isArray(currentView?.config?.visibleFields)
      ? currentView!.config!.visibleFields
      : fields.map((f:any)=>f.id)
  );
  const visibleFields = fields.filter((f:any) => visibleFieldIds.includes(f.id));
  const visibleGroups = useMemo(() => groupField ? Object.keys(groupedRows) : [], [groupedRows, groupField]);
  const visibleRows: any[] = Array.isArray(finalRows) ? finalRows : [];
  const pagedRows: any[] = visibleRows.slice((page - 1) * pageSize, page * pageSize);
  const rowIds: string[] = pagedRows.map((row: any) => row.id);
  const displayNumericFields = fields.filter((f: any) => f.type === 'number');

  // Close field menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenFieldMenu(null)
    if (openFieldMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openFieldMenu]);

  // Realtime subscription for record_values changes
  useEffect(() => {
    if (!tableId) return
    const ch = supabaseBrowser
      .channel(`rv-${tableId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'record_values', filter: `table_id=eq.${tableId}` },
        (payload) => {
          const row = payload.new || payload.old as any
          const { record_id, field_id, value } = row || {}
          setRecords(records.map((r: any) => {
            if (r.id !== record_id) return r;
            const exists = (r.values || []).some((v: any) => v.field_id === field_id);
            if (payload.eventType === 'DELETE') {
              return { ...r, values: (r.values || []).filter((v: any) => v.field_id !== field_id) };
            }
            if (exists) {
              return { ...r, values: r.values.map((v: any) => v.field_id === field_id ? { ...v, value } : v) };
            }
            return { ...r, values: [...(r.values || []), { record_id, field_id, value }] };
          }));
        }
      )
      .subscribe()

    return () => { supabaseBrowser.removeChannel(ch) }
  }, [tableId])

  // Supabase Realtime Presence
  useEffect(() => {
    if (!supabase) return;
    const baseId = params?.baseId ?? '';
    const tableId = params?.tableId ?? '';
    // Join presence channel for this table
    const channel = supabase.channel(`presence:${baseId}:${tableId}:grid`, {
      config: { presence: { key: userId } }
    });
    presenceChannelRef.current = channel;
    channel.subscribe(async (status: any) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now(), cursor });
      }
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Flatten presence state
      const users: PresenceUser[] = Object.values(state).flat().map((u: any) => ({ ...u }));
      setOnlineUsers(users);
    });
    channel.on('broadcast', { event: 'cursor' }, (payload: any) => {
      channel.track({ id: userId, name: userName, avatar: userAvatar, color: userColor, lastActive: Date.now(), cursor: payload?.cursor });
    });
    // Clean up on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [params?.baseId, params?.tableId, supabase, userId, userName, userAvatar, userColor, cursor]);

  // Broadcast cursor position on change
  useEffect(() => {
    if (presenceChannelRef.current && cursor) {
      presenceChannelRef.current.send({ type: 'broadcast', event: 'cursor', payload: { cursor } });
    }
  }, [cursor]);

  // Mouse move handler for grid
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const grid = document.querySelector('table.min-w-full');
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        setCursor({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [])

  // Remove all duplicate declarations below this point
  // Only keep one version of each helper and state
  // --- Helpers and State ---
  function reorder(a: any[], from: number, to: number) {
    const arr = a.slice();
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    return arr;
  }

  const asyncAction = async (fn: () => Promise<any>, errorMsg: string) => {
    try {
      await fn();
    } catch (err: any) {
      setNotification({ type: 'error', message: errorMsg + ': ' + (err?.message || String(err)) });
    }
  };

  async function handleAddRow() {
    await asyncAction(async () => {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Row create failed${err?.error ? `: ${err.error}` : ''}`);
      }
      const newRecord = await res.json();
      setRecords([...records, { ...newRecord, values: [] }]);
    }, 'Failed to add row');
  }

  async function saveCell(record_id: string, field_id: string, raw: any) {
    await asyncAction(async () => {
      const field = fields.find((f: any) => f.id === field_id);
      let value: any = raw;
      if (field?.type === 'number') {
        const n = Number(raw);
        value = Number.isNaN(n) ? null : n;
      } else if (field?.type === 'checkbox') {
        value = Boolean(raw);
      }
      const res = await fetch('/api/cells', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id, field_id, value })
      });
      const saved = await res.json().catch(() => null);
      if (!saved || saved.error) throw new Error(saved?.error || 'Save failed');
      setRecords(records.map((r: any) => {
        if (r.id !== record_id) return r;
        const exists = (r.values || []).some((v: any) => v.field_id === field_id);
        return exists
          ? { ...r, values: r.values.map((v: any) => (v.field_id === field_id ? saved : v)) }
          : { ...r, values: [...(r.values || []), saved] };
      }));
    }, 'Failed to save cell');
  }

  async function loadLinkOptions(field: any) {
    if (!field) return { list: [] };
    const targetId = field?.options?.target_table_id;
    if (!targetId) return { list: [] };
    if (linkCache[targetId]) {
      const { records, labels } = linkCache[targetId];
      return { list: records.map((r: any) => ({ id: r.id, label: labels[r.id] ?? r.id })) };
    }
    const recs = await fetch(`/api/records?table_id=${targetId}`).then(r => r.json()).catch(() => []);
    const labelFieldId = field?.options?.label_field_id;
    const labels: Record<string, string> = {};
    const byId: Record<string, any> = {};
    recs.forEach((r: any) => {
      const val = (r.values || []).find((v: any) => v.field_id === labelFieldId)?.value;
      labels[r.id] = (val ?? r.id);
      byId[r.id] = r;
    });
    const entry = { records: recs, byId, labels };
    setLinkCache((prev: Record<string, any>) => ({ ...prev, [targetId]: entry }));
    return { list: recs.map((r: any) => ({ id: r.id, label: labels[r.id] ?? r.id })) };
  }

  // Selection logic via Zustand (assume selection is in Zustand)
  // If not, migrate useGridSelection logic into Zustand and use selection from store
  // const rowIds = pagedRows.map((row: any) => row.id);
  // const selection = useGridSelection(rowIds);

  // Summary logic
  // const summary = useGridSummary(visibleRows, fields);

  // Bulk actions handlers
  function handleDeleteSelected() {
    // Implement bulk delete logic here using selection.selectedRowIds
  }
  function handleDuplicateSelected() {
    // Implement bulk duplicate logic here using selection.selectedRowIds
  }

  // Add handleAddField function
  async function handleAddField() {
    const payload: any = { name: fieldName, type: fieldType, table_id: tableId };
    if (fieldType === 'link') {
      if (!linkTargetTable || !linkLabelField) { alert('Pick target table + label field'); return; }
      payload.options = { target_table_id: linkTargetTable, label_field_id: linkLabelField };
    }
    if (fieldType === 'attachment') {
      payload.options = {
        accept: ['image/*', 'application/pdf'],
        maxFiles: 5,
        maxSizeMB: 10
      };
    }
    if (fieldType === 'lookup' || fieldType === 'rollup') {
      if (!linkSourceField || !lookupTargetField) {
        alert('Pick a link field and a target field'); return;
      }
      payload.options = {
        link_field_id: linkSourceField,
        target_field_id: lookupTargetField,
        ...(fieldType === 'rollup' ? { agg: rollupAgg, sep: rollupSep } : {})
      };
    }
    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const newField = await res.json().catch(() => null);
    setFieldName('');
    setFieldType('text');
    setLinkTargetTable('');
    setLinkLabelField('');
    setLinkSourceField('');
    setLookupTargetField('');
    setTargetFieldsForLookup([]);
  }

  // Show loading/error states
  if (recordsLoading || fieldsLoading || viewsLoading) return <LoadingState />;
  if (recordsError) return <ErrorState error={recordsError} />;
  if (fieldsError) return <ErrorState error={fieldsError} />;
  if (viewsError) return <ErrorState error={viewsError} />;

  // Keyboard navigation handler for toolbar and panels
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Custom tab navigation if needed
      }
    };
    toolbar.addEventListener('keydown', handleKeyDown);
    return () => toolbar.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Undo/redo stack
  const [history, setHistory] = React.useState<any[]>([]);
  const [future, setFuture] = React.useState<any[]>([]);

  // Push to history on record change
  useEffect(() => {
    setHistory(h => [...h, records]);
    setFuture([]);
  }, [records]);

  const handleUndo = () => {
    if (history.length > 1) {
      const prev = history[history.length - 2];
      setFuture(f => [records, ...f]);
      setHistory(h => h.slice(0, -1));
      setRecords(prev);
    }
  };
  const handleRedo = () => {
    if (future.length) {
      const next = future[0];
      setHistory(h => [...h, next]);
      setFuture(f => f.slice(1));
      setRecords(next);
    }
  };

  const [infinitePage, setInfinitePage] = React.useState(1);
  const infinitePageSize = 50;
  const infiniteRows = React.useMemo(() => pagedRows.slice(0, infinitePage * infinitePageSize), [pagedRows, infinitePage]);
  const loaderRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setInfinitePage(p => p + 1);
      }
    }, { threshold: 1 });
    observer.observe(loader);
    return () => observer.disconnect();
  }, [loaderRef]);

  // Add to activity log on record/cell change
  useEffect(() => {
    setActivityLog(log => [
      `Edited at ${new Date().toLocaleTimeString()}`,
      ...log.slice(0, 49)
    ]);
  }, [records]);

  // Show user presence/cursor in grid
  // Already using PresenceIndicator, but add a floating cursor for each user
  const gridRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!gridRef.current || !onlineUsers?.length) return;
    // Example: render floating cursors for each user
    onlineUsers.forEach(user => {
      if (user.cursor) {
        const cursorEl = document.createElement('div');
        cursorEl.className = 'absolute pointer-events-none z-50';
        cursorEl.style.left = `${user.cursor.x}px`;
        cursorEl.style.top = `${user.cursor.y}px`;
        cursorEl.innerHTML = `<span style='background:${user.color};padding:2px 6px;border-radius:4px;color:#fff;font-size:12px;'>${user.name}</span>`;
        cursorEl.id = `cursor-${user.id}`;
        if (gridRef.current) {
          gridRef.current.appendChild(cursorEl);
        }
      }
    });
    return () => {
      onlineUsers.forEach(user => {
        const el = document.getElementById(`cursor-${user.id}`);
        if (el && gridRef.current) gridRef.current.removeChild(el);
      });
    };
  }, [onlineUsers]);

  useEffect(() => {
    Sentry.init({
      dsn: 'https://d2926c196190c23b872bf38a32419fb3@o4509947584839680.ingest.us.sentry.io/4509947631370240',
      tracesSampleRate: 1.0,
    });
  }, []);

  // Performance analytics: log render time
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      Sentry.captureMessage(`GridPage render time: ${end - start}ms`);
    };
  }, []);

  return (
    <GridContext.Provider value={{
      // ...existing code...
    }}>
      <main ref={gridRef} className="max-w-full overflow-x-auto p-2 sm:p-6 bg-gray-50 min-h-screen relative" aria-label={t('view')}
        style={{ WebkitOverflowScrolling: 'touch' }}>
        <h1 className="text-2xl font-bold mb-4 sticky top-0 bg-gray-50 z-10">Grid</h1>
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="grid-announcer">
          {/* Announcements for screen readers will be injected here */}
        </div>
        <UndoRedo onUndo={handleUndo} onRedo={handleRedo} />
        {notification && (
          <Notification type={notification.type as 'error' | 'info' | 'success'} message={notification.message} />
        )}
        <div className="p-4">
          <div role="toolbar" aria-label="Grid controls" tabIndex={0} className="flex flex-wrap gap-2 mb-4 w-full md:w-auto">
            <ViewControls
              // ...existing code...
            />
            <FieldCreator
              // ...existing code...
            />
          </div>
          <GridToolbar
            // ...existing code...
            role="search"
            aria-label="Grid search and filter"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GridFilterPanel
              // ...existing code...
              role="region"
              aria-label="Filter panel"
            />
            <GridSortPanel
              // ...existing code...
              role="region"
              aria-label="Sort panel"
            />
          </div>
          <GridRowSelection
            // ...existing code...
            role="region"
            aria-label="Row selection"
          />
          <GridBulkActions
            // ...existing code...
            role="region"
            aria-label="Bulk actions"
          />
          <GridColumnVisibilityPanel
            // ...existing code...
            role="region"
            aria-label="Column visibility"
          />
          <GridSummary
            // ...existing code...
          />
          <div className="my-4" />
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedRows).length === 0 && (
              <GridEmptyState
                // ...existing code...
              />
            )}
            {Object.entries(groupedRows).length > 0 && (
              <>
                {visibleGroups.map((group: any, groupIndex: number) => {
                  const groupRows = groupedRows[group];
                  const firstRow = groupRows[0];
                  const isOddGroup = groupIndex % 2 === 1;
                  return (
                    <React.Fragment key={group}>
                      <GridGroupHeader
                        // ...existing code...
                        className={isOddGroup ? 'bg-gray-50' : ''}
                      />
                      {groupRows.map((row: any, rowIndex: number) => {
                        const isLastRow = rowIndex === groupRows.length - 1;
                        return (
                          <React.Fragment key={row.id}>
                            <div className="overflow-x-auto">
                              <GridTable
                                // ...existing code...
                                className="w-full min-w-[320px] sm:min-w-[600px] max-w-full overflow-x-auto rounded shadow bg-white text-xs sm:text-sm"
                                role="table"
                                aria-label="Grid table"
                                style={{ touchAction: 'manipulation' }}
                              />
                            </div>
                            {isLastRow && <div className="h-4" />}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>
          <div ref={loaderRef} className="w-full h-8 flex items-center justify-center text-gray-400">
            {infiniteRows.length < pagedRows.length ? 'Loading more rows...' : 'End of table'}
          </div>
        </div>
        <PresenceIndicator onlineUsers={onlineUsers} userId={userId} />
        <div className="mt-4 mb-2">
          <div className="font-semibold">Activity Log</div>
          <ul className="text-xs text-gray-500 max-h-32 overflow-y-auto">
            {activityLog.map((entry, i) => <li key={i}>{entry}</li>)}
          </ul>
        </div>
      </main>
    </GridContext.Provider>
  );
}

export default GridPage;