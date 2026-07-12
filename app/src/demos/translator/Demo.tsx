import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

// The Translator API is not part of TypeScript's bundled DOM lib, so we
// describe the minimal shape we need locally and cast at the call site.
type TranslatorAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface TranslatorLanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface TranslatorDownloadProgressEvent extends Event {
  readonly loaded: number;
}

type TranslatorMonitor = EventTarget;

interface TranslatorInstance {
  translate(text: string): Promise<string>;
  destroy(): void;
}

interface TranslatorCreateOptions extends TranslatorLanguagePair {
  monitor?: (monitor: TranslatorMonitor) => void;
}

interface TranslatorConstructor {
  availability(options: TranslatorLanguagePair): Promise<TranslatorAvailability>;
  create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
}

function getTranslator(): TranslatorConstructor {
  return (self as unknown as { Translator: TranslatorConstructor }).Translator;
}

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ru', label: 'Russian' },
];

const DEFAULT_TEXT = 'Progressive Web Apps work offline and can be installed on your device.';

const selectStyle: CSSProperties = {
  display: 'block',
  marginTop: '0.4rem',
  background: 'var(--surface)',
  color: 'var(--text)',
  border: '1px solid var(--surface-2)',
  borderRadius: 'var(--radius)',
  padding: '0.5rem',
};

export default function TranslatorDemo() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [text, setText] = useState(DEFAULT_TEXT);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const translatorRef = useRef<TranslatorInstance | null>(null);
  const translatorPairRef = useRef<string | null>(null);

  const destroyTranslator = () => {
    translatorRef.current?.destroy();
    translatorRef.current = null;
    translatorPairRef.current = null;
  };

  // Clean up the translator instance on unmount.
  useEffect(() => {
    return () => {
      translatorRef.current?.destroy();
      translatorRef.current = null;
      translatorPairRef.current = null;
    };
  }, []);

  // A translator instance is bound to one language pair. If the user picks a
  // different pair, the old instance is no longer valid — destroy it now and
  // require the next click to create a fresh one for the new pair.
  const handleLanguageChange = (setter: (value: string) => void, value: string) => {
    destroyTranslator();
    setOutput(null);
    setError(null);
    setter(value);
  };

  const samePair = sourceLanguage === targetLanguage;

  async function translate() {
    setError(null);
    setOutput(null);
    setDownloadProgress(null);
    setBusy(true);
    try {
      const Translator = getTranslator();
      const pairKey = `${sourceLanguage}:${targetLanguage}`;

      if (!translatorRef.current || translatorPairRef.current !== pairKey) {
        destroyTranslator();

        const availability = await Translator.availability({ sourceLanguage, targetLanguage });
        if (availability === 'unavailable') {
          throw new Error(
            `This browser cannot translate ${sourceLanguage} → ${targetLanguage} on-device.`,
          );
        }
        if (availability === 'downloadable' || availability === 'downloading') {
          setDownloadProgress(0);
        }

        translatorRef.current = await Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor(monitor) {
            monitor.addEventListener('downloadprogress', (event) => {
              setDownloadProgress((event as TranslatorDownloadProgressEvent).loaded);
            });
          },
        });
        translatorPairRef.current = pairKey;
      }

      const result = await translatorRef.current.translate(text);
      setOutput(result);
    } catch (err) {
      destroyTranslator();
      setError(err instanceof Error ? err.message : 'Translation failed.');
    } finally {
      setDownloadProgress(null);
      setBusy(false);
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Translates text entirely on-device using Chrome's built-in Translator API — nothing is sent
        to a server. The first use of a language pair may download a small language model.{' '}
        <strong>Desktop Chrome only</strong> — this API is not available in Chrome for Android or
        iOS, so the button below won't appear functional there.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <label>
          <span>From</span>
          <select
            value={sourceLanguage}
            onChange={(e) => handleLanguageChange(setSourceLanguage, e.target.value)}
            style={selectStyle}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>To</span>
          <select
            value={targetLanguage}
            onChange={(e) => handleLanguageChange(setTargetLanguage, e.target.value)}
            style={selectStyle}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: 'block', marginTop: '1rem' }}>
        <span>Text to translate</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '480px',
            marginTop: '0.4rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            resize: 'vertical',
          }}
        />
      </label>

      {samePair && (
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Choose two different languages to translate between.
        </p>
      )}

      <p style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={translate}
          disabled={busy || text.trim().length === 0 || samePair}
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1.25rem',
            cursor: busy ? 'default' : 'pointer',
          }}
        >
          {busy ? 'Translating…' : 'Translate'}
        </button>
      </p>

      {downloadProgress !== null && (
        <p role="status" style={{ color: 'var(--text-dim)' }}>
          Downloading language model… {Math.round(downloadProgress * 100)}%
        </p>
      )}

      {output && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            marginTop: '1rem',
          }}
        >
          {output}
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
