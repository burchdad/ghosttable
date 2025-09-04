import { useState, useEffect } from 'react';

export function useRecords(tableId: string) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;
    setLoading(true);
    fetch(`/api/records?table_id=${tableId}`)
      .then(r => r.json())
      .then(data => { setRecords(data); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tableId]);

  return { records, setRecords, loading, error };
}
