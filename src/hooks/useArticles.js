import { useState, useEffect, useCallback } from 'react';
import { fetchNewsByDateRange, getLatestMonthDates } from '../api';

let globalCache = null;
let globalCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

function isCacheValid() {
  return globalCache && globalCacheTime && Date.now() - globalCacheTime < CACHE_TTL && globalCache.articles?.length > 0;
}

export function useArticles() {
  const [articles, setArticles] = useState(isCacheValid() ? globalCache.articles : []);
  const [loading, setLoading] = useState(!isCacheValid());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isCacheValid()) {
      setArticles(globalCache.articles);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { startDate, endDate } = getLatestMonthDates();
        const response = await fetchNewsByDateRange(startDate, endDate);

        if (cancelled) return;

        const loaded = response.articles ?? [];
        if (loaded.length === 0) {
          setArticles([]);
          setError('No articles found for the selected date range.');
          setLoading(false);
          return;
        }

        const sorted = [...loaded].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        const seen = new Set();
        const deduped = sorted.filter((a) => {
          const key = (a.url || '').trim().toLowerCase().split('?')[0].replace(/\/+$/, '');
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        globalCache = { articles: deduped };
        globalCacheTime = Date.now();

        if (!cancelled) {
          setArticles(deduped);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load articles');
          setArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, []);

  const update = useCallback((newArticles) => {
    globalCache = { articles: newArticles || [] };
    globalCacheTime = Date.now();
    setArticles(newArticles || []);
    setLoading(false);
    setError(null);
  }, []);

  return { articles, loading, error, setArticles: update };
}
