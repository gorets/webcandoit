# PWA Showcase — Phase 1: Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the working skeleton of the PWA feature showcase: monorepo, app shell with demo registry (one real demo proving the contract), PWA plumbing (manifest + service worker + offline), Express API server, and Docker/Caddy deployment.

**Architecture:** npm-workspaces monorepo with `app/` (Vite + React SPA) and `server/` (Express). In production the server serves the built SPA and the API from one origin; in dev, Vite proxies `/api` to the server. Every demo is a self-contained folder (`meta.ts` + lazy `Demo.tsx`) wired through a central registry.

**Tech Stack:** Vite 7, React 19, TypeScript (strict), react-router 7, vite-plugin-pwa (injectManifest) + Workbox, Express 5, Biome 2, Vitest 3, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-09-pwa-showcase-design.md`

**Follow-up plans (written after this phase lands):** Phase 2 — simple client-side demos; Phase 3 — backend-dependent demos (push, incoming call, share target, background fetch); Phase 4 — hardware & experimental; Phase 5 — polish.

## Global Constraints

- TypeScript `strict: true` everywhere; CI gate is `tsc --noEmit` + `biome check` + tests.
- No CSS framework — hand-written CSS, dark theme by default, own visual design (nothing copied from whatpwacando.today).
- UI language: English.
- Single origin in production: Express serves both static build and `/api`.
- Node >= 22. Package manager: npm (workspaces).
- Every demo must feature-detect before rendering controls and show an "unsupported" panel otherwise.

---

### Task 1: Monorepo root with Biome

**Files:**
- Create: `package.json`
- Create: `biome.json`
- Create: `.nvmrc`
- Modify: `.gitignore`

**Interfaces:**
- Produces: npm workspaces `app` and `server`; root scripts `lint`, `format` used by all later tasks.

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "pwa-showcase",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "workspaces": ["app", "server"],
  "scripts": {
    "dev": "concurrently -n app,server -c cyan,magenta \"npm run dev -w app\" \"npm run dev -w server\"",
    "build": "npm run build -w app && npm run build -w server",
    "lint": "biome check .",
    "format": "biome check --write .",
    "typecheck": "npm run typecheck -w app && npm run typecheck -w server",
    "test": "npm run test -w app"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.0",
    "concurrently": "^9.0.0"
  }
}
```

- [ ] **Step 2: Create biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "includes": ["**", "!**/dist", "!**/dev-dist", "!**/node_modules"] },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always" } }
}
```

- [ ] **Step 3: Create .nvmrc and extend .gitignore**

`.nvmrc`:

```
22
```

Append to `.gitignore`:

```
dev-dist/
*.local
test-results/
playwright-report/
```

- [ ] **Step 4: Install and verify**

Run: `npm install && npx biome check .`
Expected: install succeeds; biome reports no errors (only config/docs files exist).

- [ ] **Step 5: Commit**

```bash
git add package.json biome.json .nvmrc .gitignore package-lock.json
git commit -m "chore: monorepo root with biome"
```

---

### Task 2: Vite + React + TS app workspace

**Files:**
- Create: `app/package.json`
- Create: `app/vite.config.ts`
- Create: `app/tsconfig.json`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/styles/global.css`

**Interfaces:**
- Produces: workspace `app` with scripts `dev`, `build`, `preview`, `typecheck`, `test`; `<App />` renders router placeholder replaced in Task 4.

- [ ] **Step 1: Create app/package.json**

```json
{
  "name": "app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.6.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create app/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create app/vite.config.ts**

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
```

- [ ] **Step 4: Create index.html, entry point, App and global.css**

`app/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0f1115" />
    <title>PWA Showcase</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`app/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`app/src/App.tsx` (placeholder until Task 4 adds the router):

```tsx
export function App() {
  return <h1>PWA Showcase</h1>;
}
```

`app/src/styles/global.css`:

```css
:root {
  color-scheme: dark;
  --bg: #0f1115;
  --surface: #181b22;
  --surface-2: #1f232d;
  --text: #e8eaf0;
  --text-dim: #9aa1b0;
  --accent: #5eead4;
  --danger: #f87171;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
}

a {
  color: var(--accent);
  text-decoration: none;
}

button {
  font: inherit;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: #06281f;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 5: Install and verify build**

Run: `npm install && npm run build -w app`
Expected: `tsc` passes, Vite build emits `app/dist/index.html`.

Run: `npm run lint`
Expected: no Biome errors.

- [ ] **Step 6: Commit**

```bash
git add app package-lock.json
git commit -m "feat: vite + react + ts app workspace"
```

---

### Task 3: Demo contract, registry and first demo (Vibration) — TDD

**Files:**
- Create: `app/src/demos/types.ts`
- Create: `app/src/demos/vibration/meta.ts`
- Create: `app/src/demos/vibration/Demo.tsx`
- Create: `app/src/registry.ts`
- Test: `app/src/registry.test.ts`

**Interfaces:**
- Produces:
  - `DemoMeta` type: `{ slug: string; title: string; category: DemoCategory; description: string; specUrl: string; isSupported: () => boolean; requiresBackend?: boolean; requiresInstall?: boolean }`
  - `DemoCategory` union: `'installation' | 'user' | 'display' | 'system' | 'actions' | 'network' | 'camera' | 'microphone' | 'input' | 'content' | 'screen' | 'activity' | 'device' | 'hardware'`
  - `registry.ts` exports `demoMetas: DemoMeta[]` and `demoComponents: Record<string, LazyExoticComponent<ComponentType>>`
  - Convention consumed by every later demo task: folder `app/src/demos/<slug>/` with `meta.ts` + `Demo.tsx` (default export), meta appended to `demoMetas`, component to `demoComponents`.

- [ ] **Step 1: Write the failing registry test**

`app/src/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { demoComponents, demoMetas } from './registry';

describe('demo registry', () => {
  it('has at least one demo', () => {
    expect(demoMetas.length).toBeGreaterThan(0);
  });

  it('has unique slugs', () => {
    const slugs = demoMetas.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a lazy component for every meta and no orphan components', () => {
    const slugs = new Set(demoMetas.map((m) => m.slug));
    for (const meta of demoMetas) {
      expect(demoComponents[meta.slug], `missing component for ${meta.slug}`).toBeDefined();
    }
    for (const key of Object.keys(demoComponents)) {
      expect(slugs.has(key), `orphan component ${key}`).toBe(true);
    }
  });

  it('every meta has non-empty required fields', () => {
    for (const meta of demoMetas) {
      expect(meta.title).not.toBe('');
      expect(meta.description).not.toBe('');
      expect(meta.specUrl).toMatch(/^https:\/\//);
      expect(typeof meta.isSupported).toBe('function');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w app`
Expected: FAIL — `Cannot find module './registry'` (or equivalent resolution error).

- [ ] **Step 3: Implement types, vibration demo and registry**

`app/src/demos/types.ts`:

```ts
export type DemoCategory =
  | 'installation'
  | 'user'
  | 'display'
  | 'system'
  | 'actions'
  | 'network'
  | 'camera'
  | 'microphone'
  | 'input'
  | 'content'
  | 'screen'
  | 'activity'
  | 'device'
  | 'hardware';

export interface DemoMeta {
  slug: string;
  title: string;
  category: DemoCategory;
  description: string;
  specUrl: string;
  isSupported: () => boolean;
  requiresBackend?: boolean;
  requiresInstall?: boolean;
}
```

`app/src/demos/vibration/meta.ts`:

```ts
import type { DemoMeta } from '../types';

export const vibrationMeta: DemoMeta = {
  slug: 'vibration',
  title: 'Vibration',
  category: 'device',
  description:
    'Make the device vibrate with a single pulse or a custom pattern using the Vibration API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API',
  isSupported: () => typeof navigator !== 'undefined' && 'vibrate' in navigator,
};
```

`app/src/demos/vibration/Demo.tsx`:

```tsx
export default function VibrationDemo() {
  return (
    <div>
      <button type="button" onClick={() => navigator.vibrate(200)}>
        Vibrate 200ms
      </button>
      <button type="button" onClick={() => navigator.vibrate([100, 50, 100, 50, 300])}>
        Vibrate pattern
      </button>
    </div>
  );
}
```

`app/src/registry.ts`:

```ts
import { type ComponentType, type LazyExoticComponent, lazy } from 'react';
import type { DemoMeta } from './demos/types';
import { vibrationMeta } from './demos/vibration/meta';

export const demoMetas: DemoMeta[] = [vibrationMeta];

export const demoComponents: Record<string, LazyExoticComponent<ComponentType>> = {
  vibration: lazy(() => import('./demos/vibration/Demo')),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w app`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/src/demos app/src/registry.ts app/src/registry.test.ts
git commit -m "feat: demo registry contract with vibration demo"
```

---

### Task 4: Routing, layout and demo page shell

**Files:**
- Create: `app/src/components/Layout.tsx`
- Create: `app/src/components/ErrorBoundary.tsx`
- Create: `app/src/components/UnsupportedPanel.tsx`
- Create: `app/src/pages/DemoPage.tsx`
- Create: `app/src/pages/Home.tsx` (minimal list; full grid in Task 5)
- Modify: `app/src/App.tsx`
- Test: `app/src/pages/DemoPage.test.tsx`

**Interfaces:**
- Consumes: `demoMetas`, `demoComponents` from `app/src/registry.ts` (Task 3).
- Produces: routes `/` (Home) and `/demo/:slug` (DemoPage); `<UnsupportedPanel meta={DemoMeta} />`; `<ErrorBoundary>` wrapping every demo.

- [ ] **Step 1: Write the failing DemoPage test**

`app/src/pages/DemoPage.test.tsx` (needs jsdom + testing-library, added in step 2):

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DemoPage } from './DemoPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demo/:slug" element={<DemoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DemoPage', () => {
  it('renders the demo title for a known slug', async () => {
    renderAt('/demo/vibration');
    expect(await screen.findByRole('heading', { name: 'Vibration' })).toBeDefined();
  });

  it('shows not-found for an unknown slug', () => {
    renderAt('/demo/nope');
    expect(screen.getByText(/demo not found/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Add test deps and vitest config, run test to verify it fails**

Run: `npm install -w app -D @testing-library/react jsdom`

Add to `app/vite.config.ts` (merge into the exported config):

```ts
// add at top: /// <reference types="vitest/config" />
test: {
  environment: 'jsdom',
},
```

Run: `npm run test -w app`
Expected: FAIL — `DemoPage` not found.

- [ ] **Step 3: Implement components and pages**

`app/src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          <p>This demo crashed: {this.state.error.message}</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

`app/src/components/UnsupportedPanel.tsx`:

```tsx
import type { DemoMeta } from '../demos/types';

export function UnsupportedPanel({ meta }: { meta: DemoMeta }) {
  return (
    <div
      role="status"
      style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius)' }}
    >
      <p>
        <strong>{meta.title}</strong> is not supported in this browser.
      </p>
      <p>
        Check the <a href={meta.specUrl}>documentation</a> for current browser support.
      </p>
    </div>
  );
}
```

`app/src/components/Layout.tsx`:

```tsx
import { Link, Outlet } from 'react-router';

export function Layout() {
  return (
    <>
      <header style={{ padding: '1rem 1.5rem', background: 'var(--surface)' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          PWA Showcase
        </Link>
      </header>
      <main style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
        <Outlet />
      </main>
    </>
  );
}
```

`app/src/pages/DemoPage.tsx`:

```tsx
import { Suspense } from 'react';
import { useParams } from 'react-router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { UnsupportedPanel } from '../components/UnsupportedPanel';
import { demoComponents, demoMetas } from '../registry';

export function DemoPage() {
  const { slug } = useParams();
  const meta = demoMetas.find((m) => m.slug === slug);
  const DemoComponent = slug ? demoComponents[slug] : undefined;

  if (!meta || !DemoComponent) {
    return <p>Demo not found.</p>;
  }

  return (
    <article>
      <h1>{meta.title}</h1>
      <p style={{ color: 'var(--text-dim)' }}>{meta.description}</p>
      {meta.isSupported() ? (
        <ErrorBoundary>
          <Suspense fallback={<p>Loading demo…</p>}>
            <DemoComponent />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <UnsupportedPanel meta={meta} />
      )}
      <p>
        <a href={meta.specUrl}>Documentation</a>
      </p>
    </article>
  );
}
```

`app/src/pages/Home.tsx` (minimal; replaced in Task 5):

```tsx
import { Link } from 'react-router';
import { demoMetas } from '../registry';

export function Home() {
  return (
    <ul>
      {demoMetas.map((meta) => (
        <li key={meta.slug}>
          <Link to={`/demo/${meta.slug}`}>{meta.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

`app/src/App.tsx` (replace placeholder):

```tsx
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { DemoPage } from './pages/DemoPage';
import { Home } from './pages/Home';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/demo/:slug" element={<DemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm run test -w app && npm run typecheck -w app`
Expected: all tests PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/src app/vite.config.ts app/package.json package-lock.json
git commit -m "feat: routing, layout, demo page shell"
```

---

### Task 5: Home page — category grid, search, supported filter

**Files:**
- Modify: `app/src/pages/Home.tsx`
- Create: `app/src/components/DemoCard.tsx`
- Test: `app/src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `demoMetas` (Task 3), `DemoCategory` (Task 3).
- Produces: `<DemoCard meta={DemoMeta} supported={boolean} />`; Home renders demos grouped by category with a search input (`placeholder="Search demos"`) and a checkbox labeled `Supported in my browser`.

- [ ] **Step 1: Write the failing Home test**

`app/src/pages/Home.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Home } from './Home';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('Home', () => {
  it('renders the vibration demo card', () => {
    renderHome();
    expect(screen.getByText('Vibration')).toBeDefined();
  });

  it('filters demos by search text', () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText('Search demos'), {
      target: { value: 'zzz-no-match' },
    });
    expect(screen.queryByText('Vibration')).toBeNull();
  });

  it('has a supported-only filter checkbox', () => {
    renderHome();
    expect(screen.getByLabelText('Supported in my browser')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w app`
Expected: FAIL — no search input / cards in minimal Home.

- [ ] **Step 3: Implement DemoCard and full Home**

`app/src/components/DemoCard.tsx`:

```tsx
import { Link } from 'react-router';
import type { DemoMeta } from '../demos/types';

export function DemoCard({ meta, supported }: { meta: DemoMeta; supported: boolean }) {
  return (
    <Link
      to={`/demo/${meta.slug}`}
      style={{
        display: 'block',
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        color: 'var(--text)',
      }}
    >
      <h3 style={{ margin: '0 0 0.25rem' }}>{meta.title}</h3>
      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>{meta.description}</p>
      {!supported && (
        <p style={{ margin: '0.5rem 0 0', color: 'var(--danger)', fontSize: '0.8rem' }}>
          Not supported in this browser
        </p>
      )}
    </Link>
  );
}
```

`app/src/pages/Home.tsx` (replace):

```tsx
import { useMemo, useState } from 'react';
import { DemoCard } from '../components/DemoCard';
import type { DemoCategory } from '../demos/types';
import { demoMetas } from '../registry';

const CATEGORY_LABELS: Record<DemoCategory, string> = {
  installation: 'Installation',
  user: 'User',
  display: 'Display',
  system: 'System',
  actions: 'Actions',
  network: 'Network',
  camera: 'Camera',
  microphone: 'Microphone',
  input: 'Input',
  content: 'Content',
  screen: 'Screen',
  activity: 'Activity',
  device: 'Device',
  hardware: 'Hardware',
};

export function Home() {
  const [query, setQuery] = useState('');
  const [supportedOnly, setSupportedOnly] = useState(false);

  const support = useMemo(
    () => new Map(demoMetas.map((m) => [m.slug, m.isSupported()])),
    [],
  );

  const visible = demoMetas.filter((m) => {
    if (supportedOnly && !support.get(m.slug)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });

  const categories = [...new Set(visible.map((m) => m.category))];

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search demos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--surface-2)',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
        />
        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={supportedOnly}
            onChange={(e) => setSupportedOnly(e.target.checked)}
          />
          Supported in my browser
        </label>
      </div>
      {categories.map((cat) => (
        <section key={cat}>
          <h2>{CATEGORY_LABELS[cat]}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {visible
              .filter((m) => m.category === cat)
              .map((m) => (
                <DemoCard key={m.slug} meta={m} supported={support.get(m.slug) ?? false} />
              ))}
          </div>
        </section>
      ))}
      {visible.length === 0 && <p>No demos match your search.</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test -w app && npm run typecheck -w app`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src
git commit -m "feat: home page with category grid, search and supported filter"
```

---

### Task 6: PWA plumbing — manifest, service worker, offline

**Files:**
- Modify: `app/package.json` (add `vite-plugin-pwa`, `workbox-precaching`, `workbox-routing`)
- Modify: `app/vite.config.ts`
- Create: `app/src/sw.ts`
- Create: `app/src/pwa.ts`
- Modify: `app/src/main.tsx`
- Create: `app/public/icons/icon.svg` + generated PNGs

**Interfaces:**
- Consumes: app shell from Tasks 2–5.
- Produces: registered service worker precaching the build (offline app shell); `manifest.webmanifest` with name/icons/theme. Later phases extend `app/src/sw.ts` with push/sync handlers and the manifest with `shortcuts`/`share_target`/`file_handlers` — this task establishes both files.

- [ ] **Step 1: Install deps**

Run: `npm install -w app -D vite-plugin-pwa && npm install -w app workbox-precaching workbox-routing`

- [ ] **Step 2: Create icons**

`app/public/icons/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0f1115"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#5eead4" stroke-width="28"/>
  <circle cx="256" cy="256" r="60" fill="#5eead4"/>
</svg>
```

Generate PNGs (requires ImageMagick; `brew install imagemagick` if missing):

```bash
magick -background none app/public/icons/icon.svg -resize 192x192 app/public/icons/icon-192.png
magick -background none app/public/icons/icon.svg -resize 512x512 app/public/icons/icon-512.png
```

- [ ] **Step 3: Configure vite-plugin-pwa (injectManifest)**

`app/vite.config.ts` (full replacement):

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'PWA Showcase',
        short_name: 'PWA Showcase',
        description: 'Live demos of what progressive web apps can do today.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 4: Write the service worker and registration**

`app/src/sw.ts`:

```ts
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});
```

`app/src/pwa.ts`:

```ts
export function registerServiceWorker() {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
```

Add to `app/src/main.tsx` after the imports:

```ts
import { registerServiceWorker } from './pwa';

registerServiceWorker();
```

- [ ] **Step 5: Verify build output**

Run: `npm run build -w app && ls app/dist/sw.js app/dist/manifest.webmanifest`
Expected: both files exist.

Run: `npm run test -w app && npm run lint`
Expected: PASS, no lint errors.

- [ ] **Step 6: Manual offline check**

Run: `npm run preview -w app`
In Chromium: open the printed URL, DevTools → Application → Service worker is activated; check "Offline" and reload — the app shell still renders.

- [ ] **Step 7: Commit**

```bash
git add app package-lock.json
git commit -m "feat: pwa manifest, service worker, offline app shell"
```

---

### Task 7: Express server workspace — TDD

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Test: `server/src/app.test.ts`

**Interfaces:**
- Consumes: `app/dist` (production static files, Task 6).
- Produces: `createApp(): express.Express` with `GET /api/health` → `{ "status": "ok" }`; server listens on `PORT` (default 8080); serves `app/dist` with SPA fallback in production. Phase 3 adds push/share-target/WS routes to `server/src/app.ts`.

- [ ] **Step 1: Create server workspace files**

`server/package.json`:

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0"
  }
}
```

`server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

- [ ] **Step 2: Write the failing health test**

`server/src/app.test.ts`:

```ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('api', () => {
  it('responds to health check', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

Run: `npm install && npm run test -w server`
Expected: FAIL — `./app.js` not found.

- [ ] **Step 3: Implement app and entry point**

`server/src/app.ts`:

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const appDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../app/dist');

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(appDist));
    // SPA fallback: any non-API GET returns index.html
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(appDist, 'index.html'));
    });
  }

  return app;
}
```

`server/src/index.ts`:

```ts
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8080);
createApp().listen(port, () => {
  console.log(`server listening on :${port}`);
});
```

- [ ] **Step 4: Run tests and full dev smoke**

Run: `npm run test -w server && npm run typecheck -w server`
Expected: PASS.

Run: `npm run dev` (root), then `curl -s http://localhost:5173/api/health`
Expected: `{"status":"ok"}` through the Vite proxy. Stop the dev servers.

- [ ] **Step 5: Add root test script coverage and commit**

Update root `package.json` script `test` to:

```json
"test": "npm run test -w app && npm run test -w server"
```

```bash
git add server package.json package-lock.json
git commit -m "feat: express server with health endpoint and prod static serving"
```

---

### Task 8: Playwright smoke tests

**Files:**
- Create: `e2e/smoke.spec.ts`
- Create: `playwright.config.ts`
- Modify: root `package.json` (script + dep)

**Interfaces:**
- Consumes: routes `/` and `/demo/:slug` (Task 4), registry (Task 3), built app + server (Tasks 6–7).
- Produces: `npm run e2e` — smoke suite later phases extend with per-demo route checks.

- [ ] **Step 1: Install Playwright**

Run: `npm install -D @playwright/test && npx playwright install chromium`

- [ ] **Step 2: Create playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:8080' },
  webServer: {
    command: 'npm run build -w app && NODE_ENV=production npx tsx server/src/index.ts',
    url: 'http://localhost:8080/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add root script:

```json
"e2e": "playwright test"
```

- [ ] **Step 3: Write the smoke test**

`e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('home page renders demo cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /vibration/i })).toBeVisible();
});

test('demo route renders without crashing', async ({ page }) => {
  await page.goto('/demo/vibration');
  await expect(page.getByRole('heading', { name: 'Vibration' })).toBeVisible();
});

test('service worker registers and manifest is served', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  const swReady = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(swReady).toBe(true);
});
```

- [ ] **Step 4: Run and verify**

Run: `npm run e2e`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e playwright.config.ts package.json package-lock.json .gitignore
git commit -m "test: playwright smoke suite"
```

---

### Task 9: Docker, Caddy and deployment docs

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `Caddyfile`
- Create: `.dockerignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: build pipeline (Tasks 2, 6, 7).
- Produces: `docker compose up` serving the app over HTTPS on the VPS domain (env `DOMAIN`).

- [ ] **Step 1: Create Dockerfile and .dockerignore**

`Dockerfile`:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /repo
COPY package*.json ./
COPY app/package.json app/
COPY server/package.json server/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY package*.json ./
COPY app/package.json app/
COPY server/package.json server/
RUN npm ci --omit=dev
COPY --from=build /repo/app/dist app/dist
COPY --from=build /repo/server/dist server/dist
EXPOSE 8080
CMD ["node", "server/dist/index.js"]
```

`.dockerignore`:

```
node_modules
**/node_modules
**/dist
dev-dist
.git
docs
e2e
test-results
playwright-report
```

- [ ] **Step 2: Create docker-compose.yml and Caddyfile**

`docker-compose.yml`:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    environment:
      - PORT=8080

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    environment:
      - DOMAIN=${DOMAIN:?set DOMAIN in .env}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config

volumes:
  caddy-data:
  caddy-config:
```

`Caddyfile`:

```
{$DOMAIN} {
	reverse_proxy app:8080
}
```

- [ ] **Step 3: Verify the image locally**

Run:

```bash
docker build -t pwa-showcase .
docker run --rm -d -p 8081:8080 --name pwa-smoke pwa-showcase
sleep 2 && curl -s http://localhost:8081/api/health && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081/
docker stop pwa-smoke
```

Expected: `{"status":"ok"}` and `200`.

- [ ] **Step 4: Rewrite README with dev + deploy instructions**

Replace `README.md` content:

```markdown
# PWA Showcase

Live demos of what progressive web apps can do today. Own implementation
inspired by whatpwacando.today (no code shared with it).

## Development

Requires Node >= 22.

    npm install
    npm run dev        # app on :5173, api on :8080

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run e2e`.

## Deployment (VPS)

    echo "DOMAIN=your.domain" > .env
    docker compose up -d --build

Caddy terminates HTTPS for $DOMAIN and proxies to the node server, which
serves the SPA and the API from one origin.
```

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore docker-compose.yml Caddyfile README.md
git commit -m "feat: docker + caddy deployment"
```
