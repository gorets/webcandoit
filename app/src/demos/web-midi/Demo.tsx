import { useState } from 'react';

function describe(data: Uint8Array | null): string {
  if (!data || data.length === 0) return '(empty)';
  const [status, d1, d2] = data;
  const type = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  if (type === 0x90 && d2 > 0) return `Note On  ch${channel} note ${d1} vel ${d2}`;
  if (type === 0x80 || (type === 0x90 && d2 === 0)) return `Note Off ch${channel} note ${d1}`;
  if (type === 0xb0) return `Control  ch${channel} cc ${d1} val ${d2}`;
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

export default function WebMidiDemo() {
  const [inputs, setInputs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enable = async () => {
    setError(null);
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      setInputs([...access.inputs.values()].map((i) => i.name || i.id));
      setOutputs([...access.outputs.values()].map((o) => o.name || o.id));
      for (const input of access.inputs.values()) {
        input.onmidimessage = (event) => {
          setMessages((prev) => [describe(event.data), ...prev].slice(0, 15));
        };
      }
      setEnabled(true);
    } catch {
      setError('MIDI access was denied or is unavailable.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Grant MIDI access, then play notes or turn knobs on a connected instrument to see live
        messages.
      </p>
      {!enabled && (
        <button type="button" onClick={enable}>
          Enable MIDI
        </button>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {enabled && (
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Inputs</div>
              <div>{inputs.length ? inputs.join(', ') : 'none'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Outputs</div>
              <div>{outputs.length ? outputs.join(', ') : 'none'}</div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Incoming messages
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {messages.length === 0 ? (
                <li style={{ color: 'var(--text-dim)' }}>Waiting for MIDI input…</li>
              ) : (
                messages.map((line, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: append-only message log
                  <li key={index}>{line}</li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
