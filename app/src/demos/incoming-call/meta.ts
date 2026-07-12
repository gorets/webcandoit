import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'incoming-call',
  title: 'Incoming Call Notifications',
  category: 'notifications',
  description:
    'Incoming call notifications let web apps show a persistent, call-style alert with Accept and Decline actions.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Notification',
  isSupported: () => 'serviceWorker' in navigator && 'Notification' in window,
  requiresBackend: true,
};

export default meta;
