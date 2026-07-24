import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-animations',
  title: 'Web Animations API',
  category: 'display',
  description:
    'Create and control animations from JavaScript with Element.animate(). Play, pause, reverse, and scrub — with the smoothness of CSS animations plus full runtime control.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API',
  isSupported: () =>
    typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function',
};

export default meta;
