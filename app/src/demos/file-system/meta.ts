import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'file-system',
  title: 'File System Access',
  category: 'system',
  description:
    'Open a text file from disk, edit it, and save the changes back using the File System Access API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API',
  isSupported: () => typeof window !== 'undefined' && 'showOpenFilePicker' in window,
  favorite: true,
};

export default meta;
