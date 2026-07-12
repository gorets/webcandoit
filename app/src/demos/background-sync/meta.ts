import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'background-sync',
  title: 'Background Sync',
  category: 'network',
  description:
    'Register a one-off sync tag on the service worker so a deferred task can run once connectivity returns.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API',
  isSupported: () => typeof window !== 'undefined' && 'SyncManager' in window,
  favorite: true,
};

export default meta;
