import { Link } from 'react-router';
import type { DemoMeta } from '../demos/types';
import { DemoIcon } from './DemoIcon';
import './DemoCard.css';

export function DemoCard({ meta, supported }: { meta: DemoMeta; supported: boolean }) {
  return (
    <Link
      to={`/demo/${meta.slug}`}
      className={meta.favorite ? 'demo-card demo-card-favorite' : 'demo-card'}
    >
      {meta.favorite && (
        <span className="demo-card-star" title="Favorite">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5 14.9 9l7.1.6-5.4 4.7 1.6 6.9-6.2-3.7-6.2 3.7 1.6-6.9L2 9.6l7.1-.6z" />
          </svg>
          <span className="visually-hidden">Favorite</span>
        </span>
      )}
      <span className="demo-card-icon">
        <DemoIcon slug={meta.slug} category={meta.category} size={40} />
      </span>
      <div className="demo-card-body">
        <h3>
          {meta.title}
          {meta.newFeature && <span className="demo-card-new">New</span>}
        </h3>
        <p className="demo-card-description">{meta.description}</p>
        <span className="demo-card-badges">
          <span
            className={
              meta.requiresInstall ? 'demo-card-scope demo-card-scope-pwa' : 'demo-card-scope'
            }
            title={
              meta.requiresInstall
                ? 'Only works once installed as an app'
                : 'Works in any browser tab, no install needed'
            }
          >
            {meta.requiresInstall ? 'PWA' : 'WEB'}
          </span>
          <span
            className={supported ? 'demo-card-badge demo-card-badge-supported' : 'demo-card-badge'}
          >
            <span className="demo-card-badge-dot" />
            {supported ? 'Supported' : 'Not supported'}
          </span>
        </span>
      </div>
    </Link>
  );
}
