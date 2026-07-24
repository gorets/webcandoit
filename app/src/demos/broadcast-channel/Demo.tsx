import { useEffect, useRef, useState } from 'react';

const CHANNEL_NAME = 'webcandoit-broadcast-demo';

interface Entry {
  id: number;
  direction: 'sent' | 'received';
  text: string;
}

export default function BroadcastChannelDemo() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const nextId = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<string>) => {
      setEntries((prev) => [
        { id: nextId.current++, direction: 'received', text: event.data },
        ...prev,
      ]);
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    // A channel never receives its own messages, so we record the sent copy too.
    channelRef.current?.postMessage(text);
    setEntries((prev) => [{ id: nextId.current++, direction: 'sent', text }, ...prev]);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Open this page in a second tab, then send a message. It arrives in the other tab instantly —
        no server involved.
      </p>
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
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={!draft.trim()}>
          Broadcast
        </button>
      </form>
      <ul
        role="status"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.4rem' }}
      >
        {entries.length === 0 && <li style={{ color: 'var(--text-dim)' }}>No messages yet.</li>}
        {entries.map((entry) => (
          <li
            key={entry.id}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem',
              borderLeft: `3px solid ${entry.direction === 'sent' ? 'var(--accent)' : 'var(--text-dim)'}`,
            }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginRight: '0.5rem' }}>
              {entry.direction === 'sent' ? 'sent →' : '← received'}
            </span>
            {entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
