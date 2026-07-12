import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'launch-handler',
  title: 'Launch Handler',
  category: 'installation',
  description:
    'Observes launch parameters via window.launchQueue to control how an installed app re-launches.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/LaunchParams',
  isSupported: () => typeof window !== 'undefined' && 'launchQueue' in window,
  requiresInstall: true,
};

export default meta;
