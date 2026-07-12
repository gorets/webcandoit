import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'page-lifecycle',
  title: 'Page Lifecycle',
  category: 'activity',
  description:
    'Observe freeze, resume, pagehide and pageshow events from the Page Lifecycle API and see whether this page was discarded and restored by the browser.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/freeze_event',
  isSupported: () =>
    typeof document !== 'undefined' && ('onfreeze' in document || 'wasDiscarded' in document),
};

export default meta;
