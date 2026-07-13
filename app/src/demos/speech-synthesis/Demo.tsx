import { useEffect, useState } from 'react';

const DEFAULT_TEXT = 'Hello from webcandoit.pp.ua! This is the Web Speech Synthesis API.';

export default function SpeechSynthesisDemo() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
      setVoiceName((current) => current || available[0]?.name || '');
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    setError(null);
    if (!text.trim()) return;

    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const chosenVoice = voices.find((voice) => voice.name === voiceName);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Speech synthesis failed. Please try again.');
      };
      speechSynthesis.speak(utterance);
    } catch {
      setError('Could not start speech synthesis.');
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span>Text to speak</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            resize: 'vertical',
          }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span>Voice</span>
        <select
          value={voiceName}
          onChange={(event) => setVoiceName(event.target.value)}
          disabled={voices.length === 0}
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
          }}
        >
          {voices.length === 0 && <option value="">No voices available yet…</option>}
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={speak} disabled={isSpeaking || !text.trim()}>
          Speak
        </button>
        <button type="button" onClick={stop} disabled={!isSpeaking}>
          Stop
        </button>
      </div>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {isSpeaking ? 'Speaking…' : 'Idle'}
        </div>
      )}
    </div>
  );
}
