import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'gamepad',
  title: 'Gamepad API',
  category: 'hardware',
  description:
    'Read input from connected game controllers with the Gamepad API. Detect connection events and poll buttons and analog sticks each frame.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API',
  isSupported: () => typeof navigator !== 'undefined' && 'getGamepads' in navigator,
};

export default meta;
