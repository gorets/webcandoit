import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'notifications',
  title: 'Notifications',
  category: 'notifications',
  description:
    'Request notification permission and show a notification, via the service worker when one is active.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API',
  isSupported: () => typeof window !== 'undefined' && 'Notification' in window,
  favorite: true,
};

export default meta;
