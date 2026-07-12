import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CATEGORY_LABELS, categorySectionId } from '../categories';
import type { CodeVariant } from '../components/CodeBlock';
import { DemoIcon } from '../components/DemoIcon';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { UnsupportedPanel } from '../components/UnsupportedPanel';
import { demoComponents, demoMetas, demoSnippetLoaders, demoSourceLoaders } from '../registry';
import './DemoPage.css';

const CodeBlock = lazy(() =>
  import('../components/CodeBlock').then((m) => ({ default: m.CodeBlock })),
);

function useLoadedText(loader: (() => Promise<string>) | undefined): string | null {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(null);
    if (!loader) return;
    let cancelled = false;
    loader().then((loaded) => {
      if (!cancelled) setText(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [loader]);

  return text;
}

function useCodeVariants(slug: string | undefined): CodeVariant[] {
  const source = useLoadedText(slug ? demoSourceLoaders[slug] : undefined);
  const snippet = useLoadedText(slug ? demoSnippetLoaders[slug] : undefined);

  const variants: CodeVariant[] = [];
  if (snippet) variants.push({ label: 'Vanilla JS', code: snippet, language: 'javascript' });
  if (source) variants.push({ label: 'React (this demo)', code: source, language: 'tsx' });
  return variants;
}

export function DemoPage() {
  const { slug } = useParams();
  const meta = demoMetas.find((m) => m.slug === slug);
  const DemoComponent = slug ? demoComponents[slug] : undefined;
  const codeVariants = useCodeVariants(slug);

  if (!meta || !DemoComponent) {
    return (
      <div className="demo-page">
        <p>Demo not found.</p>
      </div>
    );
  }

  const supported = meta.isSupported();

  return (
    <article className="demo-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/#${categorySectionId(meta.category)}`}>{CATEGORY_LABELS[meta.category]}</Link>
        <span aria-hidden="true">/</span>
        <span>{meta.title}</span>
      </nav>

      <div className="demo-page-title">
        <span className="demo-page-icon">
          <DemoIcon slug={meta.slug} category={meta.category} size={22} />
        </span>
        <h1>{meta.title}</h1>
      </div>
      <p className="demo-page-description">{meta.description}</p>

      <div className="demo-page-badges">
        <span
          className={meta.requiresInstall ? 'badge badge-neutral' : 'badge'}
          title={
            meta.requiresInstall
              ? 'Only works once installed as an app'
              : 'Works in any browser tab, no install needed'
          }
        >
          {meta.requiresInstall ? 'PWA' : 'WEB'}
        </span>
        <span className={supported ? 'badge badge-supported' : 'badge'}>
          <span className="badge-dot" />
          {supported ? 'Supported' : 'Not supported'}
        </span>
        {meta.requiresInstall && <span className="badge badge-neutral">Requires install</span>}
        {meta.requiresBackend && <span className="badge badge-neutral">Requires backend</span>}
      </div>

      <div className="demo-panel">
        {supported ? (
          <ErrorBoundary>
            <Suspense fallback={<p>Loading demo…</p>}>
              <DemoComponent />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <UnsupportedPanel meta={meta} />
        )}
      </div>

      {codeVariants.length > 0 && (
        <div className="demo-page-code">
          <Suspense fallback={<p>Loading code…</p>}>
            <CodeBlock variants={codeVariants} />
          </Suspense>
        </div>
      )}

      <a className="spec-link" href={meta.specUrl} target="_blank" rel="noreferrer">
        View spec →
      </a>
    </article>
  );
}
