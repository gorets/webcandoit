import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { CATEGORY_LABELS, CATEGORY_ORDER, categorySectionId } from '../categories';
import type { DemoCategory } from '../demos/types';
import { demoMetas } from '../registry';
import { CategoryIcon } from './CategoryIcon';
import './Sidebar.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { slug } = useParams();
  const isHome = location.pathname === '/';
  const [scrollActive, setScrollActive] = useState<DemoCategory | null>(null);

  const counts = useMemo(() => {
    const map = new Map<DemoCategory, number>();
    for (const meta of demoMetas) {
      map.set(meta.category, (map.get(meta.category) ?? 0) + 1);
    }
    return map;
  }, []);

  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') return;
    const sections = CATEGORY_ORDER.map((cat) =>
      document.getElementById(categorySectionId(cat)),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setScrollActive(visible[0].target.id.replace('cat-', '') as DemoCategory);
        }
      },
      { rootMargin: '-96px 0px -70% 0px' },
    );
    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  const demoCategory = !isHome ? demoMetas.find((m) => m.slug === slug)?.category : undefined;
  const activeCategory = isHome ? scrollActive : demoCategory;

  return (
    <>
      {open && <div className="sidebar-scrim" aria-hidden="true" onClick={onClose} />}
      <nav className={open ? 'sidebar sidebar-open' : 'sidebar'} aria-label="Demo categories">
        <ul className="sidebar-list">
          {CATEGORY_ORDER.map((cat) => (
            <li key={cat}>
              <Link
                to={isHome ? `#${categorySectionId(cat)}` : `/#${categorySectionId(cat)}`}
                className={
                  activeCategory === cat ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
                }
                onClick={onClose}
              >
                <CategoryIcon category={cat} size={16} />
                <span className="sidebar-link-label">{CATEGORY_LABELS[cat]}</span>
                <span className="sidebar-count">{counts.get(cat) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
