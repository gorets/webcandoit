import { useEffect, useRef, useState } from 'react';

// The Language Detector API (self.LanguageDetector) is not part of TypeScript's
// bundled DOM lib yet, so we describe the minimal shape we use locally and cast
// at the call site.
type LanguageDetectorAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface LanguageDetectorDownloadProgressEvent extends Event {
  readonly loaded: number;
}

interface LanguageDetectorCreateMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: LanguageDetectorDownloadProgressEvent) => void,
  ): void;
}

interface LanguageDetectorResult {
  detectedLanguage: string;
  confidence: number;
}

interface LanguageDetectorInstance {
  detect(text: string): Promise<LanguageDetectorResult[]>;
  destroy(): void;
}

interface LanguageDetectorCreateOptions {
  monitor?(monitor: LanguageDetectorCreateMonitor): void;
}

interface LanguageDetectorStatic {
  availability(): Promise<LanguageDetectorAvailability>;
  create(options?: LanguageDetectorCreateOptions): Promise<LanguageDetectorInstance>;
}

function getLanguageDetector(): LanguageDetectorStatic {
  return (self as unknown as { LanguageDetector: LanguageDetectorStatic }).LanguageDetector;
}

const DEFAULT_TEXT = 'La vie est belle et pleine de surprises.';
const MAX_RESULTS_SHOWN = 5;

export default function LanguageDetectorDemo() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [results, setResults] = useState<LanguageDetectorResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<LanguageDetectorInstance | null>(null);

  useEffect(() => {
    return () => {
      detectorRef.current?.destroy();
      detectorRef.current = null;
    };
  }, []);

  async function detectLanguage() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      if (!detectorRef.current) {
        const availability = await getLanguageDetector().availability();
        if (availability === 'unavailable') {
          throw new Error(
            "This device can't run the on-device language model — the Language Detector API is only available on desktop Chrome with the model downloaded.",
          );
        }
        setDownloadProgress(availability === 'available' ? null : 0);
        detectorRef.current = await getLanguageDetector().create({
          monitor(monitor) {
            monitor.addEventListener('downloadprogress', (event) => {
              setDownloadProgress(event.loaded);
            });
          },
        });
      }
      const detected = await detectorRef.current.detect(text);
      setResults(detected.slice(0, MAX_RESULTS_SHOWN));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Language detection failed.');
    } finally {
      setBusy(false);
      setDownloadProgress(null);
    }
  }

  const buttonLabel =
    downloadProgress !== null
      ? `Downloading model… ${Math.round(downloadProgress * 100)}%`
      : busy
        ? 'Detecting…'
        : 'Detect language';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        The Language Detector API identifies the language of a piece of text entirely on-device —
        nothing you type leaves the browser. It currently ships only in desktop Chrome; it is not
        available on mobile Chrome. The first use may download a small on-device model.
      </p>

      <label>
        Text to analyze
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '480px',
            marginTop: '0.25rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
          }}
        />
      </label>

      <p>
        <button type="button" onClick={detectLanguage} disabled={busy || !text.trim()}>
          {buttonLabel}
        </button>
      </p>

      {results && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
          }}
        >
          <p style={{ marginTop: 0, color: 'var(--text-dim)' }}>
            Ranked by confidence (BCP-47 language tags):
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {results.map((result, index) => (
              <li
                key={result.detectedLanguage}
                style={
                  index === 0
                    ? { fontWeight: 'bold', color: 'var(--accent)' }
                    : { color: 'var(--text)' }
                }
              >
                {result.detectedLanguage} — {Math.round(result.confidence * 100)}%
              </li>
            ))}
          </ol>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
