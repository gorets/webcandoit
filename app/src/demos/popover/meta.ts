import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'popover',
  title: 'Popover API',
  category: 'display',
  description:
    'Show a native lightweight popover with the Popover API — top-layer rendering and light-dismiss, no positioning library needed.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Popover_API',
  isSupported: () => typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype,
  newFeature: true,
};

export default meta;
