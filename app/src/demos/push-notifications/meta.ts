import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'push-notifications',
  title: 'Push Notifications',
  category: 'notifications',
  description:
    'Subscribe to push notifications with the Push API and display a local notification via the service worker.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
  isSupported: () =>
    typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator,
  requiresBackend: true,
};

export default meta;
