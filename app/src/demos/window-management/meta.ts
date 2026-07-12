import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'window-management',
  title: 'Window Management',
  category: 'display',
  description:
    'Request permission to enumerate connected displays and their geometry with the Window Management API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API',
  isSupported: () => typeof window !== 'undefined' && 'getScreenDetails' in window,
};

export default meta;
