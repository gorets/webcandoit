import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'idle-detection',
  title: 'Idle Detection',
  category: 'activity',
  description:
    'Detect when the user becomes idle and when the screen is locked using the Idle Detection API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/IdleDetector',
  isSupported: () => typeof window !== 'undefined' && 'IdleDetector' in window,
};

export default meta;
