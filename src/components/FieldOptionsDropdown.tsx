
import React from 'react';

export function FieldOptionsDropdown({
  fieldType,
  linkTargetTable,
  setLinkTargetTable,
  linkLabelField,
  setLinkLabelField,
  tablesInBase = [],
  targetFields = [],
  linkSourceField,
  setLinkSourceField,
  lookupTargetField,
  setLookupTargetField,
  targetFieldsForLookup = [],
  rollupAgg,
  setRollupAgg,
  rollupSep,
  setRollupSep,
  setChoices,
  setMaxFiles,
  setMaxSizeMB,
  setAccept,
}: any) {
  // Link field options
  if (fieldType === 'link') {
    return (
      <>
        <select
          value={linkTargetTable}
          onChange={e => setLinkTargetTable(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Target table</option>
          {tablesInBase.map((t:any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {linkTargetTable && (
          <select
            value={linkLabelField}
            onChange={e => setLinkLabelField(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Label field</option>
            {targetFields.map((f:any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
      </>
    );
  }

  // Lookup field options
  if (fieldType === 'lookup') {
    return (
      <>
        <select
          value={linkSourceField}
          onChange={e => setLinkSourceField(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Link field</option>
          {tablesInBase.map((t:any) => (
            t.fields?.filter((f:any) => f.type === 'link').map((f:any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))
          ))}
        </select>
        {linkSourceField && (
          <select
            value={lookupTargetField}
            onChange={e => setLookupTargetField(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Target field</option>
            {targetFieldsForLookup.map((f:any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
      </>
    );
  }

  // Rollup field options
  if (fieldType === 'rollup') {
    return (
      <>
        <select
          value={linkSourceField}
          onChange={e => setLinkSourceField(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Link field</option>
          {tablesInBase.map((t:any) => (
            t.fields?.filter((f:any) => f.type === 'link').map((f:any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))
          ))}
        </select>
        {linkSourceField && (
          <select
            value={lookupTargetField}
            onChange={e => setLookupTargetField(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Target field</option>
            {targetFieldsForLookup.map((f:any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
        <select
          value={rollupAgg}
          onChange={e => setRollupAgg(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="sum">Sum</option>
          <option value="avg">Average</option>
          <option value="min">Min</option>
          <option value="max">Max</option>
          <option value="count">Count</option>
          <option value="join">Join (text)</option>
        </select>
        {rollupAgg === 'join' && (
          <input
            type="text"
            value={rollupSep}
            onChange={e => setRollupSep(e.target.value)}
            placeholder="Separator"
            className="border px-2 py-1 rounded"
          />
        )}
      </>
    );
  }

  // Select field options
  if (fieldType === 'select' || fieldType === 'multi_select') {
    return (
      <input
        type="text"
        placeholder="Choices (comma separated)"
        className="border px-2 py-1 rounded"
        onChange={e => {
          if (typeof setChoices === 'function') setChoices(e.target.value.split(',').map((x:string) => x.trim()));
        }}
      />
    );
  }

  // Attachment field options
  if (fieldType === 'attachment') {
    return (
      <>
        <input
          type="number"
          placeholder="Max files"
          className="border px-2 py-1 rounded"
          onChange={e => typeof setMaxFiles === 'function' && setMaxFiles(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Max size (MB)"
          className="border px-2 py-1 rounded"
          onChange={e => typeof setMaxSizeMB === 'function' && setMaxSizeMB(Number(e.target.value))}
        />
        <input
          type="text"
          placeholder="Accept types (comma separated)"
          className="border px-2 py-1 rounded"
          onChange={e => typeof setAccept === 'function' && setAccept(e.target.value.split(',').map((x:string) => x.trim()))}
        />
      </>
    );
  }

  // Default: nothing
  return null;
}
