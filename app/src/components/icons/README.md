# Icons

Per-demo and per-category icons come from [`lucide-react`](https://lucide.dev),
mapped in `lucide-map.ts`: `DEMO_LUCIDE_ICONS` (slug -> icon component) and
`CATEGORY_LUCIDE_ICONS` (category -> icon component, used by `Sidebar` and as
`DemoIcon`'s fallback for any slug not yet in the map). Both are consumed
through `CategoryIcon.tsx` / `DemoIcon.tsx`.

`face-detection` is the one exception: it keeps a hand-drawn icon (inline in
`DemoIcon.tsx`, rendered via the shared `IconSvg` wrapper) to match a specific
reference look, rather than a Lucide icon.

When adding a new demo, add its slug to `DEMO_LUCIDE_ICONS` with a
semantically fitting Lucide icon (browse names at lucide.dev/icons). If none
fits well, it's fine to leave the slug out — `DemoIcon` falls back to the
demo's category icon.
