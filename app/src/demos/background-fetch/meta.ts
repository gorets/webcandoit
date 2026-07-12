import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'background-fetch',
  title: 'Background Fetch',
  category: 'network',
  description:
    'Hand a large download off to the service worker so it keeps going even if the page closes.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API',
  isSupported: () => typeof window !== 'undefined' && 'BackgroundFetchManager' in window,
};

export default meta;
