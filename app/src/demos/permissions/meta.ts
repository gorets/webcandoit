import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'permissions',
  title: 'Permissions API',
  category: 'system',
  description:
    'Query the current state of powerful features — geolocation, notifications, camera, and more — without triggering a prompt, and react live as the user grants or revokes access.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API',
  isSupported: () =>
    typeof navigator !== 'undefined' && !!navigator.permissions && 'query' in navigator.permissions,
};

export default meta;
