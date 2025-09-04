import React, { useState, useEffect, useMemo } from 'react';

export function Cell({ record, field, fields = [], linkCache = {}, saveCell }: {
  record: any;
  field: any;
  fields?: any[];
  linkCache?: Record<string, any>;
  saveCell?: (recordId: string, fieldId: string, value: any) => Promise<void>;
}) {
  // Accessibility and error state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Find the cell value for this field
  const existing = useMemo(
    () => (record.values || []).find((v:any) => v.field_id === field.id),
    [record.values, field.id]
  );
  const initial = existing?.value ?? (field.type === 'checkbox' ? false : '');
  const [val, setVal] = useState<any>(initial);
  const [linkChoices, setLinkChoices] = useState<{id:string,label:string}[]>([]);

  useEffect(() => { setVal(initial); }, [initial]);

  // Helper to load link options
  async function loadLinkOptions(field:any) {
    const targetId = field?.options?.target_table_id;
    if (!targetId) return { list: [] };
    if (linkCache && linkCache[targetId]) {
      const { records, labels } = linkCache[targetId];
      return { list: records.map((r:any) => ({ id:r.id, label: labels[r.id] ?? r.id })) };
    }
    // Fallback: fetch from API
    const recs = await fetch(`/api/records?table_id=${targetId}`).then(r=>r.json()).catch(()=>[]);
    const labelFieldId = field?.options?.label_field_id;
    const labels: Record<string,string> = {};
    recs.forEach((r:any) => {
      const val = (r.values || []).find((v:any) => v.field_id === labelFieldId)?.value;
      labels[r.id] = (val ?? r.id);
    });
    return { list: recs.map((r:any) => ({ id:r.id, label: labels[r.id] ?? r.id })) };
  }

  // Load link choices for link fields
  useEffect(() => {
    if (field.type !== 'link') return;
    loadLinkOptions(field).then(({list}) => setLinkChoices(list));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.id, JSON.stringify(field.options)]);

  // Formula evaluation
  function evalFormula(expr: string, record: any, fields: any[]) {
    if (!expr) return '';
    const valForField = (name: string) => {
      const f = fields.find((x:any) => x.name.toLowerCase() === name.toLowerCase());
      if (!f) return 0;
      const v = (record.values || []).find((rv:any)=>rv.field_id === f.id)?.value;
      const n = Number(v); return Number.isNaN(n) ? 0 : n;
    };
    const replaced = expr.replace(/\{([^}]+)\}/g, (_, name) => String(valForField(name)));
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('Math', `return (${replaced})`);
      const out = fn(Math);
      return (out == null || Number.isNaN(out)) ? '' : String(out);
    } catch { return ''; }
  }

  // Helper: get a record's cell value for field id
  const cellVal = (rec:any, fid:string) => (rec.values || []).find((v:any)=>v.field_id===fid)?.value;

  // Lookup and rollup fields
  if (field.type === 'lookup' || field.type === 'rollup') {
    const linkFieldId = field.options?.link_field_id;
    const targetFieldId = field.options?.target_field_id;
    if (!linkFieldId || !targetFieldId) return <span className="text-gray-400">—</span>;
    const linkField = fields.find((x:any)=>x.id===linkFieldId);
    const targetTableId = linkField?.options?.target_table_id;
    const cache = targetTableId ? linkCache[targetTableId] : undefined;
    const linkValue = cellVal(record, linkFieldId);
    const ids = Array.isArray(linkValue) ? linkValue : (linkValue ? [linkValue] : []);
    const vals:any[] = [];
    ids.forEach((id:string) => {
      const tgtRec = cache?.byId?.[id];
      if (!tgtRec) return;
      const v = cellVal(tgtRec, targetFieldId);
      if (Array.isArray(v)) vals.push(...v);
      else if (v != null) vals.push(v);
    });
    if (field.type === 'lookup') {
      return <span>{vals.map(String).join(', ')}</span>;
    }
    // rollup
    const agg = field.options?.agg || 'sum';
    if (agg === 'count') return <span>{vals.length}</span>;
    const nums = vals.map(Number).filter(n => !Number.isNaN(n));
    if (!nums.length) return <span className="text-gray-400">—</span>;
    const sum = nums.reduce((a,b)=>a+b,0);
    const out =
      agg === 'sum' ? sum :
      agg === 'avg' ? (sum / nums.length) :
      agg === 'min' ? Math.min(...nums) :
      agg === 'max' ? Math.max(...nums) :
      agg === 'join' ? vals.map(String).join(field.options?.sep || ', ') :
      sum;
    return <span>{String(out)}</span>;
  }

  if (field.type === 'formula') {
    const out = evalFormula(field.options?.expr || '', record, fields);
    return <span className="text-gray-800">{out}</span>;
  }

  // Update save logic to show loading indicator
  const handleSave = async (value: any) => {
    setLoading(true);
    try {
      if (saveCell) await saveCell(record.id, field.id, value);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center" role="checkbox" aria-checked={Boolean(val)} tabIndex={0}>
        <input
          type="checkbox"
          checked={Boolean(val)}
          onChange={e => { setVal(e.target.checked); handleSave(e.target.checked); }}
          aria-label={field.name}
          disabled={loading}
        />
        {loading && <span className="ml-2 animate-spin">⏳</span>}
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  if (field.type === 'select') {
    const choices: string[] = Array.isArray(field.options?.choices) ? field.options.choices : [];
    return (
      <div className="flex items-center" role="combobox" aria-label={field.name} tabIndex={0}>
        <select
          className="w-full outline-none"
          value={val ?? ''}
          onChange={e => { setVal(e.target.value); handleSave(e.target.value); }}
          disabled={loading}
        >
          <option value=""></option>
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {loading && <span className="ml-2 animate-spin">⏳</span>}
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  if (field.type === 'multi_select') {
    const choices: string[] = Array.isArray(field.options?.choices) ? field.options.choices : [];
    const selected = Array.isArray(val) ? val : [];
    return (
      <div className="flex items-center" role="listbox" aria-label={field.name} tabIndex={0}>
        <select
          multiple
          className="w-full outline-none"
          value={selected}
          onChange={e => {
            const arr = Array.from(e.target.selectedOptions).map(o => o.value);
            setVal(arr);
            handleSave(arr);
          }}
        >
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  if (field.type === 'date' || field.type === 'datetime') {
    const inputType = field.type === 'date' ? 'date' : 'datetime-local';
    const str = typeof val === 'string' ? val : '';
    return (
      <div className="flex items-center" role="textbox" aria-label={field.name} tabIndex={0}>
        <input
          type={inputType}
          className="w-full outline-none"
          value={str}
          onChange={e => { setVal(e.target.value); handleSave(e.target.value); }}
        />
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  if (field.type === 'link') {
    return (
      <div className="flex items-center" role="combobox" aria-label={field.name} tabIndex={0}>
        <select
          className="w-full outline-none"
          value={val ?? ''}
          onChange={e => { setVal(e.target.value); handleSave(e.target.value); }}
        >
          <option value=""></option>
          {linkChoices.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  if (field.type === 'attachment') {
    const acceptList: string[] = Array.isArray(field.options?.accept) ? field.options.accept : [];
    const accept = acceptList.length ? acceptList.join(',') : undefined;
    const maxFiles = Number(field.options?.maxFiles) || 0;
    const maxSizeMB = Number(field.options?.maxSizeMB) || 0;
    const filesArr = Array.isArray(val) ? val as any[] : [];
    const [preview, setPreview] = useState<Record<string, string>>({});

    function isImage(meta: any) {
      const t = (meta?.type || '').toLowerCase();
      const n = (meta?.name || '').toLowerCase();
      return t.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(n);
    }

    async function signedUrl(path: string, seconds = 120) {
      const q = new URLSearchParams({ path, expiresIn: String(seconds) });
      const r = await fetch(`/api/attachments/url?${q.toString()}`);
      const { url } = await r.json();
      return url as string;
    }

    useEffect(() => {
      let cancelled = false;
      (async () => {
        const imgFiles = filesArr.filter(isImage);
        const entries = await Promise.all(
          imgFiles.map(async (f:any) => [f.path, await signedUrl(f.path, 120)] as const)
        );
        if (cancelled) return;
        const map: Record<string,string> = {};
        for (const [p,u] of entries) map[p] = u;
        setPreview(map);
      })();
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filesArr)]);

    async function uploadOne(file: File) {
      if (maxFiles && filesArr.length >= maxFiles) { alert(`Max files (${maxFiles}) reached`); return; }
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) { alert(`Max size ${maxSizeMB}MB`); return; }
      const sig = await fetch('/api/attachments/sign', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ record_id: record.id, field_id: field.id, filename: file.name })
      }).then(r=>r.json());
      if (sig?.error) { alert(sig.error); return; }
      // 2) upload using anon client
      // NOTE: supabaseBrowser must be available in context for this to work
      // const up = await supabaseBrowser.storage.from('attachments').uploadToSignedUrl(sig.path, sig.token, file);
      // if (up.error) { alert(up.error.message); return; }
      const meta = { path: sig.path, name: file.name, size: file.size, type: file.type };
      const saved = await fetch('/api/attachments/save', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ record_id: record.id, field_id: field.id, file: meta })
      }).then(r=>r.json());
      if (saved?.error) { alert(saved.error); return; }
      const next = [...filesArr, meta];
      setVal(next);
      // OPTIONAL: also call your saveCell to keep table state in sync immediately
      // saveCell && saveCell(record.id, field.id, next);
      if (isImage(meta)) {
        const url = await signedUrl(meta.path, 120);
        setPreview(p => ({ ...p, [meta.path]: url }));
      }
    }

    async function open(path: string) {
      const url = await signedUrl(path, 60);
      if (url) window.open(url, '_blank');
    }

    async function remove(path: string) {
      if (!confirm('Delete this file?')) return;
      const resp = await fetch('/api/attachments/delete', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ record_id: record.id, field_id: field.id, path })
      }).then(r=>r.json());
      if (resp?.error) { alert(resp.error); return; }
      const next = filesArr.filter((f:any) => f.path !== path);
      setVal(next);
      // OPTIONAL: saveCell && saveCell(record.id, field.id, next);
    }

    function onDrop(ev: React.DragEvent<HTMLDivElement>) {
      ev.preventDefault();
      const list = Array.from(ev.dataTransfer.files || []);
      list.forEach(uploadOne);
    }

    return (
      <div
        className="flex flex-col gap-2"
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        title="Drop files here or use the chooser"
        role="group"
        aria-label={field.name}
        tabIndex={0}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={e => {
            const list = Array.from(e.target.files || []);
            list.forEach(uploadOne);
            e.currentTarget.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          {filesArr.map((f:any, i:number) => (
            <div key={f.path || i} className="text-xs flex items-center gap-2 border rounded px-2 py-1">
              {isImage(f) && preview[f.path] ? (
                <img src={preview[f.path]} alt={f.name} className="w-10 h-10 object-cover rounded" />
              ) : null}
              <button className="underline" onClick={() => open(f.path)} title="Open" aria-label={`Open ${f.name}`}>{f.name || 'file'}</button>
              <span className="text-gray-500">{Math.round((f.size||0)/1024)}kB</span>
              <button className="text-red-600" onClick={() => remove(f.path)} title="Delete" aria-label={`Delete ${f.name}`}>✕</button>
            </div>
          ))}
        </div>
        {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
      </div>
    );
  }

  // Default: text/number input
  const inputType = field.type === 'number' ? 'number' : 'text';
  return (
    <div className="flex items-center" role="textbox" aria-label={field.name} tabIndex={0}>
      <input
        type={inputType}
        className="w-full outline-none"
        value={val ?? ''}
        onChange={e => setVal(e.target.value)}
        onBlur={() => handleSave(val)}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        aria-label={field.name}
        disabled={loading}
      />
      {loading && <span className="ml-2 animate-spin">⏳</span>}
      {error && <span className="text-xs text-red-500 ml-2" role="alert">{error}</span>}
    </div>
  );
}
