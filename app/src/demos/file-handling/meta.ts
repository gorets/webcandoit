import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'file-handling',
  title: 'File Handling',
  category: 'system',
  description:
    'Register the app as a file handler via the manifest and receive launch files through window.launchQueue.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API',
  isSupported: () => typeof window !== 'undefined' && 'launchQueue' in window,
  requiresInstall: true,
};

export default meta;
