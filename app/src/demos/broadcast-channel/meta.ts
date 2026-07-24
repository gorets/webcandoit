import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'broadcast-channel',
  title: 'Broadcast Channel',
  category: 'network',
  description:
    'Send messages between browsing contexts (tabs, windows, workers) of the same origin with the BroadcastChannel API. Open this page in two tabs to see it in action.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API',
  isSupported: () => typeof BroadcastChannel !== 'undefined',
};

export default meta;
