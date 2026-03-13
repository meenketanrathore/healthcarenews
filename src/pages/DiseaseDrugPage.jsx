import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchDiseaseDrugNews } from '../api';
import SearchBar from '../components/SearchBar';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import ShareBar from '../components/ShareBar';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { normalizeCountry } from '../utils/countryNormalize';
import { blank } from '../utils/blank';
import './DiseaseDrugPage.css';

function DiseaseDrugPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDiseaseDrugNews({ limit, offset: currentPage * limit });
        setArticles(result.articles || []);
        setTotal(result.total || 0);
      } catch (err) {
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage]);

  const availableCompanies = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => { if (Array.isArray(a.companies)) a.companies.forEach((c) => set.add(c)); });
    return [...set].sort();
  }, [articles]);

  const availableDiseases = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => { if (Array.isArray(a.diseases)) a.diseases.forEach((d) => set.add(d)); });
    return [...set].sort();
  }, [articles]);

  const availableDrugs = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => { if (Array.isArray(a.drugs)) a.drugs.forEach((d) => set.add(d)); });
    return [...set].sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (selectedCompanies.length > 0) list = list.filter((a) => (a.companies || []).some((c) => selectedCompanies.some((s) => String(c).toLowerCase().includes(String(s).toLowerCase()))));
    if (selectedDiseases.length > 0) list = list.filter((a) => (a.diseases || []).some((d) => selectedDiseases.some((s) => String(d).toLowerCase().includes(String(s).toLowerCase()))));
    if (selectedDrugs.length > 0) list = list.filter((a) => (a.drugs || []).some((d) => selectedDrugs.some((s) => String(d).toLowerCase().includes(String(s).toLowerCase()))));
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((a) => {
        return [a.title, a.excerpt, a.content, ...(a.companies || []), ...(a.diseases || []), ...(a.drugs || [])].filter(Boolean).join(' ').toLowerCase().includes(term);
      });
    }
    return list;
  }, [articles, searchTerm, selectedCompanies, selectedDiseases, selectedDrugs]);

  if (loading && articles.length === 0) return <Loader message="Loading disease and drug news..." />;

  return (
    <div className="dd-page">
      <section className="dd-hero">
        <h1>Disease & Drug News</h1>
        <p>Track healthcare companies, conditions, and treatments in the news.</p>
        <div className="dd-hero-count">
          <strong>{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
          {total > filtered.length && <span className="dd-hero-total"> of {total} total</span>}
        </div>
      </section>

      <section className="dd-filters">
        <h3 className="dd-filters-heading">Refine Results</h3>
        <div className="dd-filters-grid">
          <MultiSelectDropdown label="Company" options={availableCompanies} selectedValues={selectedCompanies} onChange={setSelectedCompanies} placeholder="All companies" />
          <MultiSelectDropdown label="Disease" options={availableDiseases} selectedValues={selectedDiseases} onChange={setSelectedDiseases} placeholder="All diseases" />
          <MultiSelectDropdown label="Drug" options={availableDrugs} selectedValues={selectedDrugs} onChange={setSelectedDrugs} placeholder="All drugs" />
        </div>
      </section>

      <SearchBar onSearch={setSearchTerm} placeholder="Search by title, content, company, disease, or drug..." />

      {error && <div className="dd-error" role="alert"><p>Error: {error}</p></div>}

      {filtered.length === 0 && !loading && (
        <div className="dd-empty">
          <p>No articles found. Try adjusting your filters.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="dd-articles">
          {filtered.map((article, i) => (
            <motion.article
              key={article.id || i}
              className="dd-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
            >
              <div className="dd-card-meta">
                {blank(article.date) && <span className="dd-meta-item">{blank(article.date)}</span>}
                {article.category && <span className="dd-category-badge">{article.category}</span>}
                {blank(normalizeCountry(article.country)) && <span className="dd-meta-item">{blank(normalizeCountry(article.country))}</span>}
                {article.sentiment && <span className={`dd-sentiment dd-sentiment--${article.sentiment.toLowerCase()}`}>{article.sentiment}</span>}
              </div>

              <h2 className="dd-card-title">
                {article.url ? <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a> : article.title}
              </h2>

              {article.excerpt && <p className="dd-card-excerpt">{article.excerpt}</p>}

              {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className="dd-read-more">Read full article &rarr;</a>}

              <div className="dd-entities">
                {(article.companies || []).length > 0 && (
                  <div className="dd-entity-row">
                    <span className="dd-entity-label">Companies</span>
                    <div className="dd-entity-tags">{article.companies.map((c, j) => <span key={j} className="dd-tag dd-tag--company">{c}</span>)}</div>
                  </div>
                )}
                {(article.diseases || []).length > 0 && (
                  <div className="dd-entity-row">
                    <span className="dd-entity-label">Diseases</span>
                    <div className="dd-entity-tags">{article.diseases.map((d, j) => <span key={j} className="dd-tag dd-tag--disease">{d}</span>)}</div>
                  </div>
                )}
                {(article.drugs || []).length > 0 && (
                  <div className="dd-entity-row">
                    <span className="dd-entity-label">Drugs</span>
                    <div className="dd-entity-tags">{article.drugs.map((d, j) => <span key={j} className="dd-tag dd-tag--drug">{d}</span>)}</div>
                  </div>
                )}
              </div>

              {article.source && <div className="dd-card-source">Source: {article.source}</div>}
              <ShareBar url={article.url} title={article.title} text={article.excerpt} content={article.content} />
            </motion.article>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={Math.ceil(total / limit)} onPageChange={setCurrentPage} />
    </div>
  );
}

export default DiseaseDrugPage;
