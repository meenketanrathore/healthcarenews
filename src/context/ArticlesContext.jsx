import { createContext, useContext, useMemo } from 'react';
import { useArticles } from '../hooks/useArticles';

const ArticlesContext = createContext(null);

export function ArticlesProvider({ children }) {
  const { articles, loading, error, setArticles } = useArticles();
  const value = useMemo(() => ({ articles, loading, error, setArticles }), [articles, loading, error, setArticles]);
  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export function useArticlesContext() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error('useArticlesContext must be used within ArticlesProvider');
  return {
    articles: ctx.articles || [],
    loading: ctx.loading !== undefined ? ctx.loading : true,
    error: ctx.error || null,
    setArticles: ctx.setArticles || (() => {}),
  };
}
