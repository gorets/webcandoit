import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'speech-recognition',
  title: 'Speech Recognition',
  category: 'audio',
  description: 'Transcribe speech from the microphone live, using the Web Speech Recognition API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition',
  isSupported: () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
};

export default meta;
