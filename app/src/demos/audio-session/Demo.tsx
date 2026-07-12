import { useEffect, useState } from 'react';

type AudioSessionType =
  | 'auto'
  | 'playback'
  | 'transient'
  | 'transient-solo'
  | 'ambient'
  | 'play-and-record'
  | 'sonification';

/** Minimal shape of the experimental (Safari) Audio Session API. */
interface AudioSessionLike extends EventTarget {
  type: AudioSessionType;
  state: 'inactive' | 'active' | 'interrupted';
}

const AUDIO_SESSION_TYPES: AudioSessionType[] = [
  'auto',
  'playback',
  'transient',
  'transient-solo',
  'ambient',
  'play-and-record',
  'sonification',
];

function getAudioSession(): AudioSessionLike | null {
  const nav = navigator as Navigator & { audioSession?: AudioSessionLike };
  return nav.audioSession ?? null;
}

export default function AudioSessionDemo() {
  const [type, setType] = useState<AudioSessionType>('auto');
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getAudioSession();
    if (!session) {
      setError('The Audio Session API is not available in this browser.');
      return;
    }

    setType(session.type);
    setState(session.state);

    const updateState = () => setState(session.state);
    session.addEventListener('statechange', updateState);
    return () => session.removeEventListener('statechange', updateState);
  }, []);

  const handleChange = (next: AudioSessionType) => {
    const session = getAudioSession();
    if (!session) return;
    try {
      session.type = next;
      setType(session.type);
      setError(null);
    } catch {
      setError('Could not set the audio session type.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        On Safari, the audio session type affects how the OS mixes and interrupts your app's audio
        (e.g. muting music, or ducking while it plays).
      </p>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span>Session type</span>
        <select
          value={type}
          onChange={(event) => handleChange(event.target.value as AudioSessionType)}
          disabled={!!error}
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
          }}
        >
          {AUDIO_SESSION_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          Current type: <strong style={{ color: 'var(--text)' }}>{type}</strong>
          {state && (
            <>
              {' · '}Session state: <strong style={{ color: 'var(--text)' }}>{state}</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
