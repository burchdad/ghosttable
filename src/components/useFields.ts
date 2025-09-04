import { useState, useEffect } from 'react';

export function useFields(tableId: string) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;
    setLoading(true);
    fetch(`/api/fields?table_id=${tableId}`)
      .then(r => r.json())
      .then(data => { setFields(data); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tableId]);

  return { fields, setFields, loading, error };
}
