import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-hid',
  title: 'WebHID',
  category: 'hardware',
  description:
    'Pick a HID device from the browser chooser and inspect its identifiers and report collections.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API',
  isSupported: () => typeof navigator !== 'undefined' && 'hid' in navigator,
};

export default meta;
