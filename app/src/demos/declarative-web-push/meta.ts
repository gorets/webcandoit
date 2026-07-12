import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'declarative-web-push',
  title: 'Declarative Web Push',
  category: 'notifications',
  description:
    'Declarative Web Push lets web apps receive push notifications without a service worker, even when the app is not active.',
  specUrl:
    'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Declarative_web_push',
  isSupported: () => typeof window !== 'undefined' && 'PushManager' in window,
  requiresBackend: true,
};

export default meta;
