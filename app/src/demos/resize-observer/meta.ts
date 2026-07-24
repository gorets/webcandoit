import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'resize-observer',
  title: 'Resize Observer',
  category: 'display',
  description:
    'React to changes in an element’s size — not just the window — with ResizeObserver. Reports content-box dimensions without polling or layout thrashing.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver',
  isSupported: () => typeof ResizeObserver !== 'undefined',
};

export default meta;
