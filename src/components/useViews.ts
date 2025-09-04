import { useState, useEffect } from 'react';

export function useViews(tableId: string) {
  const [views, setViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;
    setLoading(true);
    fetch(`/api/views?table_id=${tableId}`)
      .then(r => r.json())
      .then(data => { setViews(data); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tableId]);

  return { views, setViews, loading, error };
}
