import { create } from 'zustand';
import { GridState, Field, Record, View } from './types';

export interface GridUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  userColor?: string;
}

export interface GridSession {
  supabase: any;
  presenceChannelRef: any;
  cursor: { x: number; y: number } | null;
}

export interface GridUIState {
  filterField: string;
  filterVal: string;
  filterOp: string;
  sortField: string;
  sortDir: string;
  groupField: string;
  q: string;
  searchIds: string[] | null;
  page: number;
  pageSize: number;
  showColsPicker: boolean;
}

export interface GridActions {
  setFields: (fields: Field[]) => void;
  setRecords: (records: Record[]) => void;
  setViews: (views: View[]) => void;
  setActiveView: (id: string) => void;
  setSelection: (ids: Set<string>) => void;
  setBaseId: (id: string) => void;
  setTableId: (id: string) => void;
  setUser: (user: GridUser) => void;
  setSession: (session: GridSession) => void;
  setFilterField: (val: string) => void;
  setFilterVal: (val: string) => void;
  setFilterOp: (val: string) => void;
  setSortField: (val: string) => void;
  setSortDir: (val: string) => void;
  setGroupField: (val: string) => void;
  setQ: (val: string) => void;
  setSearchIds: (val: string[] | null) => void;
  setPage: (val: number) => void;
  setPageSize: (val: number) => void;
  setShowColsPicker: (val: boolean) => void;
  setLinkCache: (cache: { [key: string]: any } | ((prev: { [key: string]: any }) => { [key: string]: any })) => void;
  setCursor: (cursor: { x: number; y: number } | null) => void;
  setRecordsLoading: (val: boolean) => void;
  setFieldsLoading: (val: boolean) => void;
  setViewsLoading: (val: boolean) => void;
  setRecordsError: (err: any) => void;
  setFieldsError: (err: any) => void;
  setViewsError: (err: any) => void;
}

export type StoreType = GridState & GridUser & GridSession & GridUIState & GridActions & {
  linkCache: { [key: string]: any };
  recordsLoading: boolean;
  fieldsLoading: boolean;
  viewsLoading: boolean;
  recordsError: any;
  fieldsError: any;
  viewsError: any;
};

export const useGridStore = create<StoreType>((set: (state: Partial<StoreType>) => void) => ({
  fields: [],
  records: [],
  views: [],
  activeView: '',
  selection: new Set<string>(),
  baseId: '',
  tableId: '',
  userId: '',
  userName: '',
  userAvatar: undefined,
  userColor: '#3b82f6',
  supabase: null,
  presenceChannelRef: null,
  cursor: null,
  filterField: '',
  filterVal: '',
  filterOp: 'contains',
  sortField: '',
  sortDir: 'asc',
  groupField: '',
  q: '',
  searchIds: null,
  page: 1,
  pageSize: 50,
  showColsPicker: false,
  linkCache: {},
  recordsLoading: false,
  fieldsLoading: false,
  viewsLoading: false,
  recordsError: null,
  fieldsError: null,
  viewsError: null,
  setFields: (fields: Field[]) => set({ fields: fields }),
  setRecords: (records: Record[]) => set({ records: records }),
  setViews: (views: View[]) => set({ views: views }),
  setActiveView: (id: string) => set({ activeView: id }),
  setSelection: (ids: Set<string>) => set({ selection: ids }),
  setBaseId: (id: string) => set({ baseId: id }),
  setTableId: (id: string) => set({ tableId: id }),
  setUser: (user: GridUser) => set({ userId: user.userId, userName: user.userName, userAvatar: user.userAvatar, userColor: user.userColor }),
  setSession: (session: GridSession) => set({ supabase: session.supabase, presenceChannelRef: session.presenceChannelRef, cursor: session.cursor }),
  setFilterField: (val: string) => set({ filterField: val }),
  setFilterVal: (val: string) => set({ filterVal: val }),
  setFilterOp: (val: string) => set({ filterOp: val }),
  setSortField: (val: string) => set({ sortField: val }),
  setSortDir: (val: string) => set({ sortDir: val }),
  setGroupField: (val: string) => set({ groupField: val }),
  setQ: (val: string) => set({ q: val }),
  setSearchIds: (val: string[] | null) => set({ searchIds: val }),
  setPage: (val: number) => set({ page: val }),
  setPageSize: (val: number) => set({ pageSize: val }),
  setShowColsPicker: (val: boolean) => set({ showColsPicker: val }),
  setLinkCache: (cache: { [key: string]: any } | ((prev: { [key: string]: any }) => { [key: string]: any })) => {
    if (typeof cache === 'function') {
      set({ linkCache: cache((useGridStore.getState().linkCache)) });
    } else {
      set({ linkCache: cache });
    }
  },
  setCursor: (cursor: { x: number; y: number } | null) => set({ cursor }),
  setRecordsLoading: (val: boolean) => set({ recordsLoading: val }),
  setFieldsLoading: (val: boolean) => set({ fieldsLoading: val }),
  setViewsLoading: (val: boolean) => set({ viewsLoading: val }),
  setRecordsError: (err: any) => set({ recordsError: err }),
  setFieldsError: (err: any) => set({ fieldsError: err }),
  setViewsError: (err: any) => set({ viewsError: err }),
}));
