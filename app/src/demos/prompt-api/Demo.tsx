import { useEffect, useRef, useState } from 'react';

// The Prompt API (window.LanguageModel) is not part of TypeScript's bundled DOM
// lib yet, so we describe the minimal shape we use locally and cast at the
// call site.
type LanguageModelAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface LanguageModelDownloadProgressEvent extends Event {
  readonly loaded: number;
}

interface LanguageModelCreateMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: LanguageModelDownloadProgressEvent) => void,
  ): void;
}

interface LanguageModelSession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

interface LanguageModelCreateOptions {
  monitor?(monitor: LanguageModelCreateMonitor): void;
}

interface LanguageModelStatic {
  availability(): Promise<LanguageModelAvailability>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

function getLanguageModel(): LanguageModelStatic {
  return (self as unknown as { LanguageModel: LanguageModelStatic }).LanguageModel;
}

type Status = 'checking' | LanguageModelAvailability;

function statusMessage(status: Status): string {
  switch (status) {
    case 'checking':
      return 'Checking on-device model availability…';
    case 'unavailable':
      return "This device doesn't support the on-device model, or it hasn't been downloaded yet.";
    case 'downloadable':
      return 'The on-device model is available to download.';
    case 'downloading':
      return 'The on-device model is downloading…';
    case 'available':
      return 'The on-device model is ready.';
    default:
      return '';
  }
}

const DEFAULT_PROMPT = 'Explain what a Progressive Web App is in one sentence.';

export default function PromptApiDemo() {
  const [status, setStatus] = useState<Status>('checking');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [promptText, setPromptText] = useState(DEFAULT_PROMPT);
  const [response, setResponse] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<LanguageModelSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const availability = await getLanguageModel().availability();
        if (!cancelled) setStatus(availability);
      } catch (err) {
        if (!cancelled) {
          setStatus('unavailable');
          setError(
            err instanceof Error ? err.message : 'Could not check on-device model availability.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      sessionRef.current?.destroy();
      sessionRef.current = null;
    };
  }, []);

  async function startSession() {
    setError(null);
    setCreating(true);
    setDownloadProgress(0);
    try {
      const session = await getLanguageModel().create({
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => {
            setDownloadProgress(event.loaded);
          });
        },
      });
      sessionRef.current = session;
      setSessionReady(true);
      setStatus('available');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to download or start the on-device model.',
      );
    } finally {
      setCreating(false);
      setDownloadProgress(null);
    }
  }

  async function send() {
    const session = sessionRef.current;
    if (!session || !promptText.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await session.prompt(promptText);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The model failed to generate a response.');
    } finally {
      setBusy(false);
    }
  }

  const showDownloadButton =
    !sessionReady && (status === 'downloadable' || status === 'downloading');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        The Prompt API runs Gemini Nano directly in Chrome, entirely on-device. The first use on a
        device downloads the model, which can take a while; after that, prompts run locally with no
        network round-trip.
      </p>

      <p role="status" style={{ margin: 0 }}>
        {statusMessage(status)}
        {creating && downloadProgress !== null && ` (${Math.round(downloadProgress * 100)}%)`}
      </p>

      {showDownloadButton && (
        <button type="button" onClick={startSession} disabled={creating}>
          {creating ? 'Downloading…' : 'Download & start'}
        </button>
      )}

      {sessionReady && (
        <>
          <label>
            Prompt
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
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
            <button type="button" onClick={send} disabled={busy || !promptText.trim()}>
              {busy ? 'Sending…' : 'Send'}
            </button>
          </p>
          {response && (
            <div
              role="status"
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {response}
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
