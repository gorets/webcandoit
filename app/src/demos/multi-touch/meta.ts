import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'multi-touch',
  title: 'Multi-touch (Pointer Events)',
  category: 'input',
  description:
    'Track multiple simultaneous touch points on a surface using Pointer Events, rendering a dot for each active contact.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events',
  isSupported: () => typeof window !== 'undefined' && 'PointerEvent' in window,
};

export default meta;
