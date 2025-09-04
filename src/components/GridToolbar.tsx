import React from 'react';

export function GridToolbar({
  fieldName,
  setFieldName,
  fieldType,
  setFieldType,
  handleAddField,
  handleAddRow,
  FieldOptionsDropdown,
  ...fieldOptionsProps
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
        onChange={e => setFieldType(e.target.value)}
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
      <FieldOptionsDropdown fieldType={fieldType} {...fieldOptionsProps} />
      <button className="bg-black text-white px-4 py-2 rounded" onClick={handleAddField}>
        + Add Field
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddRow}>
        + Add Row
      </button>
      {/* Add view/filter/sort/group/search controls here if desired */}
    </div>
  );
}
