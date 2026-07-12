# Demo authoring guide

Every demo is a self-contained folder `app/src/demos/<slug>/` with exactly two files.
The registry (`app/src/registry.ts`) auto-discovers them via `import.meta.glob` — you never
edit the registry, Home, or any shared file. Just create your folder.

## The two files

### `meta.ts` — default-exports a `DemoMeta`

```ts
import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'my-demo',            // MUST equal the folder name exactly, kebab-case
  title: 'My Demo',           // human title shown on the card + page heading
  category: 'device',         // one of the 15 categories below
  description: 'One sentence describing what this demonstrates.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/...', // MDN or spec, https
  isSupported: () => typeof navigator !== 'undefined' && 'someApi' in navigator,
  // requiresBackend: true,   // optional — set if it needs our /api server (see note)
  // requiresInstall: true,   // optional — set if it only works when installed as a PWA
};

export default meta;
```

### `Demo.tsx` — default-exports the React component

```tsx
export default function MyDemo() {
  // ...
}
```

## The load-bearing contract (READ THIS)

`DemoPage` renders your `<Demo />` **only when `meta.isSupported()` returns true**, wrapped in an
ErrorBoundary + Suspense. So inside `Demo.tsx` you may call the API directly — you do NOT need to
re-check existence. But you MUST still handle **runtime** failures gracefully:

- Permission denials (`NotAllowedError`), user cancels, hardware absent, network errors → catch and
  show a friendly human message in the UI (not a thrown error, not a bare console.error).
- Keep state for the result/error and render it. Never leave the user staring at a dead button.

`isSupported()` must be a cheap **synchronous** feature check (`'x' in navigator`, `typeof X !== 'undefined'`,
`'someMethod' in SomeProto.prototype`). Do not call the API or request permission inside `isSupported`.
For APIs whose presence is synchronous but whose usability needs an async probe (e.g. WebGPU adapter),
feature-detect the entry point synchronously in `isSupported`, then do the async probe inside the component.

## Categories (use one exactly)

`installation` `notifications` `security` `display` `system` `actions` `network` `camera` `audio`
`input` `graphics` `screen` `activity` `device` `hardware`

## Style & conventions

- Dark theme via CSS variables already in `app/src/styles/global.css`:
  `--bg --surface --surface-2 --text --text-dim --accent --danger --radius`.
  Use inline `style={{ ... }}` referencing `var(--...)` (that's the established pattern; see vibration).
- Buttons: `<button type="button">` (Biome requires an explicit type).
- Lay out a demo as: short intro if needed → interactive controls → a result/status area.
- Use `useState`/`useEffect`/`useRef`; clean up listeners, streams, intervals, and object URLs on unmount.
- Stop any MediaStream tracks and revoke object URLs you create.
- No external dependencies — browser APIs + React only. No new npm packages.
- TypeScript strict. Biome: single quotes, semicolons always, import ordering (Biome will reorder;
  just run `npm run lint` / `npx biome check --write` on your files).
- Accessibility: label controls; use `role="status"`/`role="alert"` for result/error regions.

## Backend note

If a demo has `requiresBackend: true`, the app's Express server currently only exposes `/api/health`.
Full server endpoints (push send, WebSocket call signaling, share-target receiver) arrive in a later
phase. For now: build the complete **client** side, and when the demo would call a not-yet-existing
`/api/...` endpoint, detect failure (fetch rejects / non-OK) and show "Server endpoint not available
yet (coming in a later phase)". Demos that work fully client-side (e.g. showing a local notification via
`registration.showNotification`) should work for real now.

## Reference example

See `app/src/demos/vibration/meta.ts` and `app/src/demos/vibration/Demo.tsx` for the canonical shape.

## Before you finish

Run from repo root and make sure all pass with pristine output:
- `npm run lint`
- `npm run typecheck -w app`
- `npm run test -w app`  (the registry test auto-validates your folder↔slug and required fields)
- `npm run build -w app` (confirms your glob-discovered demo compiles and lazy-loads)
