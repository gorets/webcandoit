import { useEffect, useMemo } from 'react';
import { useLocation, useOutletContext } from 'react-router';
import { CATEGORY_LABELS, CATEGORY_ORDER, categorySectionId } from '../categories';
import { DemoCard } from '../components/DemoCard';
import { Hero } from '../components/Hero';
import type { HomeOutletContext } from '../components/Layout';
import { demoMetas } from '../registry';
import './Home.css';

export function Home() {
  const { query, supportedOnly } = useOutletContext<HomeOutletContext>();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  const support = useMemo(() => new Map(demoMetas.map((m) => [m.slug, m.isSupported()])), []);

  const visible = demoMetas.filter((m) => {
    if (supportedOnly && !support.get(m.slug)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });

  const categories = CATEGORY_ORDER.filter((c) => visible.some((m) => m.category === c));

  return (
    <div className="home">
      <Hero />
      {categories.map((cat) => (
        <section key={cat} id={categorySectionId(cat)} className="category-section">
          <h2>{CATEGORY_LABELS[cat]}</h2>
          <div className="demo-grid">
            {visible
              .filter((m) => m.category === cat)
              .map((m) => (
                <DemoCard key={m.slug} meta={m} supported={support.get(m.slug) ?? false} />
              ))}
          </div>
        </section>
      ))}
      {visible.length === 0 && <p className="home-empty">No demos match your search.</p>}
    </div>
  );
}
