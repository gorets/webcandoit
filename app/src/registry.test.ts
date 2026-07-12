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

  it('auto-discovers the vibration demo', () => {
    expect(demoMetas.some((m) => m.slug === 'vibration')).toBe(true);
    expect(demoComponents.vibration).toBeDefined();
  });
});
