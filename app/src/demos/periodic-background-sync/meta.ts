import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'periodic-background-sync',
  title: 'Periodic Background Sync',
  category: 'network',
  description:
    'Register a periodic sync tag so the service worker can refresh content in the background at a browser-chosen interval.',
  specUrl:
    'https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API',
  isSupported: () =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PeriodicSyncManager' in window,
  requiresInstall: true,
};

export default meta;
