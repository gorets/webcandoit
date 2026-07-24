import { useEffect, useRef, useState } from 'react';

interface Entry {
  id: number;
  from: 'you' | 'peer';
  text: string;
}

export default function WebRtcDemo() {
  const localChannelRef = useRef<RTCDataChannel | null>(null);
  const peersRef = useRef<{ pc1: RTCPeerConnection; pc2: RTCPeerConnection } | null>(null);
  const nextId = useRef(0);
  const [status, setStatus] = useState('connecting…');
  const [connected, setConnected] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const pc1 = new RTCPeerConnection();
    const pc2 = new RTCPeerConnection();
    peersRef.current = { pc1, pc2 };

    // Normally candidates travel through a signaling server; here we relay them
    // directly between the two in-page peers.
    pc1.onicecandidate = (event) => {
      if (event.candidate) pc2.addIceCandidate(event.candidate);
    };
    pc2.onicecandidate = (event) => {
      if (event.candidate) pc1.addIceCandidate(event.candidate);
    };
    pc1.onconnectionstatechange = () => {
      setStatus(pc1.connectionState);
      setConnected(pc1.connectionState === 'connected');
    };

    const channel = pc1.createDataChannel('chat');
    localChannelRef.current = channel;
    channel.onmessage = (event) => {
      setEntries((prev) => [{ id: nextId.current++, from: 'peer', text: event.data }, ...prev]);
    };

    // The second peer echoes whatever it receives back to the first.
    pc2.ondatachannel = (event) => {
      const remote = event.channel;
      remote.onmessage = (msg) => {
        remote.send(`echo: ${msg.data}`);
      };
    };

    (async () => {
      const offer = await pc1.createOffer();
      await pc1.setLocalDescription(offer);
      await pc2.setRemoteDescription(offer);
      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);
      await pc1.setRemoteDescription(answer);
    })();

    return () => {
      pc1.close();
      pc2.close();
      peersRef.current = null;
      localChannelRef.current = null;
    };
  }, []);

  const send = () => {
    const text = draft.trim();
    const channel = localChannelRef.current;
    if (!text || channel?.readyState !== 'open') return;
    channel.send(text);
    setEntries((prev) => [{ id: nextId.current++, from: 'you', text }, ...prev]);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Two peers are connected inside this page over a data channel. Send a message and the second
        peer echoes it straight back — no server in between.
      </p>
      <div role="status">
        Connection:{' '}
        <strong style={{ color: connected ? 'var(--accent)' : 'var(--text-dim)' }}>{status}</strong>
      </div>
      <form
        style={{ display: 'flex', gap: '0.5rem' }}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message…"
          disabled={!connected}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={!connected || !draft.trim()}>
          Send
        </button>
      </form>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.4rem' }}>
        {entries.map((entry) => (
          <li
            key={entry.id}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem',
              borderLeft: `3px solid ${entry.from === 'you' ? 'var(--accent)' : 'var(--text-dim)'}`,
            }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginRight: '0.5rem' }}>
              {entry.from === 'you' ? 'you →' : '← peer'}
            </span>
            {entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
