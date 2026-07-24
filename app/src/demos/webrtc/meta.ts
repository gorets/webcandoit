import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'webrtc',
  title: 'WebRTC Data Channel',
  category: 'network',
  description:
    'Establish a peer-to-peer connection with RTCPeerConnection and exchange data directly over an RTCDataChannel. This demo wires two peers together in the same page as a loopback.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API',
  isSupported: () => typeof RTCPeerConnection !== 'undefined',
};

export default meta;
