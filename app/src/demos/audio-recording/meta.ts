import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'audio-recording',
  title: 'Audio Recording',
  category: 'audio',
  description: 'Record audio from the microphone with MediaRecorder and play back the result.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API',
  isSupported: () =>
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices &&
    'getUserMedia' in navigator.mediaDevices,
};

export default meta;
