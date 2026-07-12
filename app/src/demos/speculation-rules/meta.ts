import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'speculation-rules',
  title: 'Speculation Rules',
  category: 'network',
  description:
    'Hint the browser to prerender or prefetch a page in advance using the Speculation Rules API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API',
  isSupported: () =>
    typeof HTMLScriptElement !== 'undefined' &&
    'supports' in HTMLScriptElement &&
    HTMLScriptElement.supports('speculationrules'),
};

export default meta;
