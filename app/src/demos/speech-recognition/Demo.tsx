import { useEffect, useRef, useState } from 'react';

/** Minimal shape of the Web Speech API's SpeechRecognition, which TypeScript's DOM lib lacks. */
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export default function SpeechRecognitionDemo() {
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = () => {
    setError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not available in this browser.');
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setFinalText((prev) => `${prev}${prev ? ' ' : ''}${final.trim()}`);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone access was denied. Allow microphone access and try again.');
      } else if (event.error === 'no-speech') {
        setError('No speech was detected. Try again.');
      } else {
        setError('Speech recognition failed. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setError('Could not start speech recognition.');
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const clearTranscript = () => {
    setFinalText('');
    setInterimText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={isListening}>
          Start
        </button>
        <button type="button" onClick={stop} disabled={!isListening}>
          Stop
        </button>
        <button type="button" onClick={clearTranscript} disabled={!finalText && !interimText}>
          Clear
        </button>
      </div>

      {isListening && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          Listening…
        </div>
      )}

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          minHeight: '4rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {finalText}
        {interimText && (
          <span style={{ color: 'var(--text-dim)' }}>
            {finalText ? ' ' : ''}
            {interimText}
          </span>
        )}
        {!finalText && !interimText && (
          <span style={{ color: 'var(--text-dim)' }}>Transcript will appear here…</span>
        )}
      </div>
    </div>
  );
}
