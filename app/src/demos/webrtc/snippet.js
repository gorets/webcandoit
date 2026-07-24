// Two peers, connected in the same page as a loopback.
const pc1 = new RTCPeerConnection();
const pc2 = new RTCPeerConnection();

// Relay ICE candidates between peers (normally via a signaling server).
pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

const channel = pc1.createDataChannel('chat');
channel.onopen = () => channel.send('hello');
channel.onmessage = (e) => console.log('reply:', e.data);

pc2.ondatachannel = (e) => {
  e.channel.onmessage = (msg) => e.channel.send(`echo: ${msg.data}`);
};

// Offer / answer handshake.
const offer = await pc1.createOffer();
await pc1.setLocalDescription(offer);
await pc2.setRemoteDescription(offer);
const answer = await pc2.createAnswer();
await pc2.setLocalDescription(answer);
await pc1.setRemoteDescription(answer);
