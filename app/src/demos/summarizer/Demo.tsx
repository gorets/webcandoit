import { useEffect, useRef, useState } from 'react';

type SummaryLength = 'short' | 'medium' | 'long';
type SummarizerAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface DownloadProgressEventLike {
  loaded: number;
}

interface SummarizerMonitorLike {
  addEventListener: (
    type: 'downloadprogress',
    listener: (event: DownloadProgressEventLike) => void,
  ) => void;
}

interface SummarizerCreateOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: SummaryLength;
  monitor?: (monitor: SummarizerMonitorLike) => void;
}

interface SummarizerInstance {
  summarize: (input: string) => Promise<string>;
  destroy: () => void;
}

interface SummarizerStatic {
  availability: () => Promise<SummarizerAvailability>;
  create: (options?: SummarizerCreateOptions) => Promise<SummarizerInstance>;
}

function getSummarizerCtor(): SummarizerStatic | undefined {
  return (globalThis as typeof globalThis & { Summarizer?: SummarizerStatic }).Summarizer;
}

const DEFAULT_TEXT =
  'Progressive Web Apps (PWAs) are websites that can be installed like native apps. ' +
  'They work offline using service workers, send push notifications, and can access ' +
  'hardware features like the camera, geolocation, and vibration motor. Because they ' +
  'are still websites at heart, updates ship instantly without an app-store review, ' +
  'yet users still get an icon on their home screen and a full-screen experience that ' +
  'feels indistinguishable from a native app.';

export default function SummarizerDemo() {
  const [availability, setAvailability] = useState<SummarizerAvailability | 'checking'>('checking');
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [length, setLength] = useState<SummaryLength>('short');
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const summarizerRef = useRef<SummarizerInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    const Summarizer = getSummarizerCtor();
    if (!Summarizer) {
      setAvailability('unavailable');
      return;
    }
    Summarizer.availability()
      .then((result) => {
        if (!cancelled) setAvailability(result);
      })
      .catch(() => {
        if (!cancelled) setAvailability('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      summarizerRef.current?.destroy();
      summarizerRef.current = null;
    };
  }, []);

  const handleSummarize = async () => {
    const Summarizer = getSummarizerCtor();
    if (!Summarizer || !inputText.trim()) return;

    setBusy(true);
    setError(null);
    setSummary(null);
    setDownloadProgress(null);

    try {
      // Creating must happen inside this click handler (transient user
      // activation) — it both starts/continues the on-device model download
      // (if needed) and prepares the summarizer.
      const summarizer = await Summarizer.create({
        type: 'tldr',
        format: 'plain-text',
        length,
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => {
            setDownloadProgress(event.loaded);
          });
        },
      });
      summarizerRef.current = summarizer;
      setAvailability('available');
      setDownloadProgress(null);

      const result = await summarizer.summarize(inputText);
      setSummary(result);

      summarizer.destroy();
      summarizerRef.current = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError("Summarization is blocked by this page's permissions policy.");
      } else if (err instanceof Error) {
        setError(err.message || 'Could not summarize the text.');
      } else {
        setError('Could not summarize the text.');
      }
    } finally {
      setBusy(false);
      setDownloadProgress(null);
    }
  };

  const statusMessage = (() => {
    switch (availability) {
      case 'checking':
        return 'Checking on-device model availability…';
      case 'unavailable':
        return 'The Summarizer model is unavailable on this device.';
      case 'downloadable':
        return 'Model not downloaded yet — the first click below downloads it (this may take a moment).';
      case 'downloading':
        return 'Downloading the on-device model…';
      case 'available':
        return 'On-device model ready.';
      default:
        return '';
    }
  })();

  const disabled = busy || !inputText.trim() || availability === 'unavailable';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)', margin: 0 }}>
        Paste or edit the text below, pick a summary length, then summarize it. The model runs
        entirely on-device — nothing you paste is sent to a server.
      </p>

      <div role="status" style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        {statusMessage}
        {busy && downloadProgress !== null && ` ${Math.round(downloadProgress * 100)}%`}
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        Text to summarize
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem',
            font: 'inherit',
          }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '200px' }}>
        Summary length
        <select
          value={length}
          onChange={(e) => setLength(e.target.value as SummaryLength)}
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.4rem',
            font: 'inherit',
          }}
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </label>

      <p>
        <button type="button" onClick={handleSummarize} disabled={disabled}>
          {busy ? 'Summarizing…' : 'Summarize'}
        </button>
      </p>

      {summary && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            color: 'var(--text)',
          }}
        >
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            Summary ({length})
          </div>
          {summary}
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
