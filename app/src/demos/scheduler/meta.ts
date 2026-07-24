import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'scheduler',
  title: 'Prioritized Task Scheduling',
  category: 'system',
  description:
    'Schedule work with explicit priorities using scheduler.postTask(). The browser runs user-blocking tasks before user-visible ones, and background tasks last — keeping the main thread responsive.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API',
  isSupported: () =>
    typeof window !== 'undefined' &&
    typeof (window as Window & { scheduler?: { postTask?: unknown } }).scheduler?.postTask ===
      'function',
  newFeature: true,
};

export default meta;
