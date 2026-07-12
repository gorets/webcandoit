import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'contact-picker',
  title: 'Contact Picker',
  category: 'system',
  description:
    "Let the user pick one or more contacts from their device's address book via a native picker.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API',
  isSupported: () =>
    typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window,
};

export default meta;
