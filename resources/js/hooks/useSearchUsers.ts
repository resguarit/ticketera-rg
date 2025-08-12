import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchUserResult { id: number; name: string; email: string }

export function useSearchUsers(organizerId: number) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const doFetch = async (q: string) => {
    if (!q) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(route('admin.organizers.search-users', organizerId) + '?q=' + encodeURIComponent(q));
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  };

  const search = useCallback((q: string) => {
    setTerm(q);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doFetch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); }, []);

  return { term, setTerm: search, results, loading };
}
