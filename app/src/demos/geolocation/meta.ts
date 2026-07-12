import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'geolocation',
  title: 'Geolocation',
  category: 'system',
  description: 'Read the device location once or watch it continuously using the Geolocation API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API',
  isSupported: () => typeof navigator !== 'undefined' && 'geolocation' in navigator,
  favorite: true,
};

export default meta;
