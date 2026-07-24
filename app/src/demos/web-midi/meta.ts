import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-midi',
  title: 'Web MIDI',
  category: 'hardware',
  description:
    'Talk to MIDI instruments and controllers with the Web MIDI API. Enumerate inputs and outputs and receive live note, control-change, and other MIDI messages.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API',
  isSupported: () => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator,
};

export default meta;
