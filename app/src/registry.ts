import { type ComponentType, type LazyExoticComponent, lazy } from 'react';
import type { DemoMeta } from './demos/types';

// Auto-discovery: every demo is a self-contained folder under src/demos/<slug>/
// with a `meta.ts` that default-exports its DemoMeta and a `Demo.tsx` that
// default-exports its component. Adding a demo needs no edit here.
const metaModules = import.meta.glob('./demos/*/meta.ts', { eager: true }) as Record<
  string,
  { default: DemoMeta }
>;

const componentModules = import.meta.glob('./demos/*/Demo.tsx') as Record<
  string,
  () => Promise<{ default: ComponentType }>
>;

const sourceLoaders = import.meta.glob('./demos/*/Demo.tsx', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// A folder may optionally add `snippet.js`: a short, framework-free version of
// the essential API usage, shown alongside the full component source as a
// separate "Vanilla JS" tab on the demo page.
const snippetLoaders = import.meta.glob('./demos/*/snippet.js', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// './demos/vibration/meta.ts' -> 'vibration'
function folderOf(path: string): string {
  return path.split('/')[2];
}

export const demoMetas: DemoMeta[] = Object.entries(metaModules)
  .map(([path, mod]) => {
    const folder = folderOf(path);
    const meta = mod.default;
    if (meta.slug !== folder) {
      throw new Error(`Demo slug "${meta.slug}" does not match its folder "${folder}"`);
    }
    return meta;
  })
  .sort((a, b) => {
    if (!!a.favorite !== !!b.favorite) return a.favorite ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

export const demoComponents: Record<string, LazyExoticComponent<ComponentType>> = {};
for (const [path, loader] of Object.entries(componentModules)) {
  demoComponents[folderOf(path)] = lazy(loader);
}

export const demoSourceLoaders: Record<string, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(sourceLoaders)) {
  demoSourceLoaders[folderOf(path)] = loader;
}

export const demoSnippetLoaders: Record<string, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(snippetLoaders)) {
  demoSnippetLoaders[folderOf(path)] = loader;
}
