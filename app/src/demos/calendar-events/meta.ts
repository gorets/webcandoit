import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'calendar-events',
  title: 'Calendar Events',
  category: 'actions',
  description:
    'Generate a downloadable .ics calendar file for a sample event from user input, built with a Blob and an object URL.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Blob',
  isSupported: () => true,
};

export default meta;
