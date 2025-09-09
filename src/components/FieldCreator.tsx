import React from 'react';
import { FieldOptionsDropdown } from './FieldOptionsDropdown';

export function FieldCreator({
  fieldName,
  setFieldName,
  fieldType,
  setFieldType,
  linkTargetTable,
  setLinkTargetTable,
  linkLabelField,
  setLinkLabelField,
  tablesInBase,
  targetFields,
  linkSourceField,
  setLinkSourceField,
  lookupTargetField,
  setLookupTargetField,
  targetFieldsForLookup,
  rollupAgg,
  setRollupAgg,
  rollupSep,
  setRollupSep,
  handleAddField,
  handleAddRow
}: any) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center">
      <input
        type="text"
        placeholder="Field name"
        value={fieldName}
        onChange={e => setFieldName(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <select
        value={fieldType}
        onChange={e => setFieldType(e.target.value as any)}
        className="border px-2 py-1 rounded"
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="checkbox">Checkbox</option>
        <option value="select">Select (choices)</option>
        <option value="link">Link (single)</option>
        <option value="attachment">Attachment</option>
        <option value="formula">Formula</option>
        <option value="lookup">Lookup (from link)</option>
        <option value="rollup">Rollup (sum/avg/etc.)</option>
      </select>
      <FieldOptionsDropdown
        fieldType={fieldType}
        linkTargetTable={linkTargetTable}
        setLinkTargetTable={setLinkTargetTable}
        linkLabelField={linkLabelField}
        setLinkLabelField={setLinkLabelField}
        tablesInBase={tablesInBase}
        targetFields={targetFields}
        linkSourceField={linkSourceField}
        setLinkSourceField={setLinkSourceField}
        lookupTargetField={lookupTargetField}
        setLookupTargetField={setLookupTargetField}
        targetFieldsForLookup={targetFieldsForLookup}
        rollupAgg={rollupAgg}
        setRollupAgg={setRollupAgg}
        rollupSep={rollupSep}
        setRollupSep={setRollupSep}
      />
      <button className="bg-black text-white px-4 py-2 rounded" onClick={handleAddField}>
        + Add Field
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddRow}>
        + Add Row
      </button>
    </div>
  );
}
export default FieldCreator;
