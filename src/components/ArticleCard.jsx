import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ShareBar from './ShareBar';
import { blank } from '../utils/blank';
import { normalizeCountry } from '../utils/countryNormalize';
import { getMatchingCategories, getCategoryLabel } from '../data/categories';
import { filterMedicalTags } from '../data/medicalKeywords';
import './ArticleCard.css';

function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const s = sentiment.toLowerCase();
  const cls = s === 'positive' ? 'positive' : s === 'negative' ? 'negative' : 'neutral';
  return <span className={`sentiment-badge ${cls}`}>{sentiment}</span>;
}

function ArticleCard({ article, index = 0 }) {
  const country = normalizeCountry(article.country);
  const categories = getMatchingCategories(article);
  const categoryLabel = getCategoryLabel(categories[0] || 'Other');
  const medicalTags = filterMedicalTags(
    Array.isArray(article.tags) ? article.tags.map((t) => blank(t)).filter(Boolean) : []
  );

  const getExcerpt = (text, max = 3) => {
    if (!text) return [];
    const sentences = text.replace(/\n+/g, ' ').trim().split(/(?<=\.)\s+/).filter(Boolean);
    return sentences.slice(0, max);
  };

  const sentences = getExcerpt(article.excerpt || article.content);

  return (
    <motion.article
      className="article-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="ac-meta">
        {blank(article.date) && (
          <span className="ac-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {blank(article.date)}
          </span>
        )}
        {country && (
          <span className="ac-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            {country}
          </span>
        )}
        {blank(article.company) && (
          <span className="ac-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" /></svg>
            {blank(article.company)}
          </span>
        )}
        <SentimentBadge sentiment={article.sentiment} />
      </div>

      <Link to={`/category/${encodeURIComponent(categories[0] || 'All')}`} className="ac-category-link">
        {categoryLabel}
      </Link>

      <h3 className="ac-title">
        {article.url ? (
          <a href={article.url} target="_blank" rel="noopener noreferrer">{blank(article.title)}</a>
        ) : (
          blank(article.title)
        )}
      </h3>

      {sentences.length > 0 && (
        <div className="ac-excerpt">
          {sentences.map((s, i) => <p key={i}>{s}</p>)}
        </div>
      )}

      {medicalTags.length > 0 && (
        <div className="ac-tags">
          {medicalTags.slice(0, 6).map((tag, i) => (
            <span key={i} className="ac-tag">{tag}</span>
          ))}
        </div>
      )}

      {article.source && (
        <div className="ac-source">Source: {article.source}</div>
      )}

      <ShareBar url={article.url} title={article.title} text={article.excerpt} content={article.content} />
    </motion.article>
  );
}

export default ArticleCard;
