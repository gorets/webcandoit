# PWA Showcase — Visual Redesign & Navigation — Design

**Date:** 2026-07-10
**Status:** Approved

## Goal

The skeleton phase (see `2026-07-09-pwa-showcase-design.md`) shipped with placeholder visuals: dark theme, inline styles on every component, a logo-only header, and a flat card grid with no hierarchy. This spec replaces that with a real, light, commercial-grade visual design and a proper navigation shell (sticky top nav + category sidebar), while keeping the existing routing, registry, and demo-module contract unchanged. Scope is visual/UX only — no new demos, no backend changes.

## Constraints & decisions

- **Light theme only**, replacing the current dark default. No theme toggle (out of scope; can be added later).
- **No CSS framework, no external font/icon CDN.** Hand-written CSS with design tokens, system font stack (keeps the PWA offline-first — no blocking font request), category icons as small inline SVGs.
- **No new routes.** Home stays a single scrollable page (hero + sidebar + grouped grid); demo detail stays at `/demo/:slug`.
- **Styling approach:** move off inline `style={{}}` objects into co-located CSS files per component (plain CSS, class-based), plus a shared token layer in `global.css`. This is a maintainability fix as much as a visual one — inline styles are why every component currently looks unstyled.
- **Existing tests may need markup updates** (`Home.test.tsx`, `DemoPage.test.tsx`, `e2e/smoke.spec.ts`) since headings/structure change; behavior (search, filter, routing) must not regress.

## Design tokens (`global.css`)

```css
:root {
  color-scheme: light;
  --bg: #ffffff;
  --surface: #f7f8fa;
  --surface-2: #eef0f3;
  --border: #e4e7ec;
  --text: #14171f;
  --text-dim: #667085;
  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --accent-soft: #eef2ff;
  --success: #16a34a;
  --neutral-badge: #667085;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-pill: 9999px;
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0 4px 12px rgba(16, 24, 40, 0.08);
  --nav-height: 64px;
  --sidebar-width: 240px;
}
```

Type scale: hero H1 ~2.5rem/700 with tight letter-spacing; section H2 ~1.25rem/650; body 1rem/400; dim/meta 0.8125–0.925rem. System font stack retained (`system-ui, -apple-system, "Segoe UI", sans-serif`).

## Layout & navigation

**Top nav** — sticky, `--nav-height` tall, white background, subtle bottom border. Contents: wordmark "PWA Showcase" (left), global search input (right, always visible on desktop). On mobile (<768px): wordmark + search icon (expands on tap) + hamburger button.

**Sidebar** — `--sidebar-width` wide, sticky below the nav. Vertical list of the 14 categories (label + demo count) plus an "All" entry at top, and the "Supported in my browser" toggle (styled as a switch). Clicking a category smooth-scrolls to its `<section id="cat-{category}">` anchor on the home page; a scroll-spy (IntersectionObserver) highlights the active category as the user scrolls. On the demo detail page the same sidebar renders, with category links pointing back to `/#cat-{category}` — clicking one navigates home and scrolls to that section.

**Mobile nav** — below 768px the sidebar is hidden and replaced by a drawer: hamburger in the top nav opens a left-slide-in overlay with a dark scrim, containing the same category list + toggle. Tapping a category closes the drawer and scrolls/navigates as on desktop. All interactive targets ≥44px.

**Grid breakpoints** — `repeat(auto-fill, minmax(260px,1fr))` desktop; forced 2 columns ~480–768px; 1 column below 480px.

## Home page

1. **Hero** (new): eyebrow label "Progressive Web Apps", H1 "See what PWAs can do on your device", one-line subtitle, and a stat pill row computed from the registry at render time (e.g. "77 demos · 14 categories · runs entirely in your browser") — no hardcoded counts.
2. **Search + filter row** (existing behavior, restyled): search input + "Supported in my browser" toggle (the toggle also lives in the sidebar; keep one canonical control — sidebar on desktop, both accessible via drawer on mobile — see open question resolved below: the row above the grid keeps just the search input; the supported-only toggle moves solely into the sidebar/drawer to avoid duplicate controls).
3. **Category sections**, each `<section id="cat-{category}">` with an H2 and the card grid, unchanged data flow from `registry.ts`.

## Demo card

White card, 1px `--border`, `--radius-md`, padding 1.25rem. Hover: `--shadow-md`, border tints to `--accent-soft`, `translateY(-2px)`, transition ~150ms. Header row: small inline-SVG category icon + title. Description clamped to 2 lines. Bottom-right: status pill — green dot + "Supported", or neutral-gray pill + "Not supported" (no red/danger color — this is an expected state, not an error).

## Demo detail page

Keeps the shared shell (nav + sidebar). Adds:
- Breadcrumb: `Home / {Category} / {Title}`
- Title + description (unchanged content, restyled)
- Badge row: support-status badge, plus tags for `requiresBackend` / `requiresInstall` when present on the meta
- The live demo mounted inside a bordered "panel" (`--surface`, `--radius-md`, padding) to visually separate interactive content from chrome
- Footer: spec/MDN link styled as a button-like link ("View spec →")
- `UnsupportedPanel` and `ErrorBoundary` fallback restyled to match the card/panel system (neutral panel, no jarring red text block)

## Error handling

No behavioral changes to error handling (route-level `ErrorBoundary`, permission-denial messaging, backend-absence detection all stay as implemented). This spec only restyles their presentation containers.

## Testing

- Update `Home.test.tsx` / `DemoPage.test.tsx` for new markup (breadcrumb, hero, sidebar) while preserving assertions on search/filter/routing behavior.
- `e2e/smoke.spec.ts` (home renders, every demo route renders) should continue to pass unmodified in behavior; update selectors only if they target removed elements.
- Manual verification pass (via the `run`/`verify` skill) at both desktop and a mobile viewport (~375px) after implementation: hero renders, sidebar/drawer works, category scroll-spy highlights correctly, card hover states, demo detail breadcrumb + panel, unsupported-demo panel styling.
- No new automated visual-regression tooling introduced (out of scope).

## Out of scope

- Dark mode / theme toggle
- Any new demos or backend endpoints
- Renaming routes or the registry contract
- Icon font or external font loading
