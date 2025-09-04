export interface Field {
  id: string;
  name: string;
  type: string;
  options?: any;
}

export interface Record {
  id: string;
  values: Array<{ field_id: string; value: any }>;
}

export interface View {
  id: string;
  name: string;
  config: any;
}

export interface GridState {
  fields: Field[];
  records: Record[];
  views: View[];
  activeView: string;
  selection: Set<string>;
  baseId: string;
  tableId: string;
}
