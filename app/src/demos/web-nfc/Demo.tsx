import { useEffect, useRef, useState } from 'react';

interface NDEFRecordLike {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: ArrayBuffer | DataView;
}

interface NDEFMessageLike {
  records: NDEFRecordLike[];
}

interface NDEFReadingEventLike extends Event {
  serialNumber: string;
  message: NDEFMessageLike;
}

interface NDEFReaderLike extends EventTarget {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  write: (message: string, options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: NDEFReadingEventLike) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}

interface NDEFReaderConstructorLike {
  new (): NDEFReaderLike;
}

function getNDEFReaderConstructor(): NDEFReaderConstructorLike {
  return (window as unknown as { NDEFReader: NDEFReaderConstructorLike }).NDEFReader;
}

function decodeRecord(record: NDEFRecordLike): string {
  if (!record.data) return '(no data)';
  try {
    const view = record.data instanceof DataView ? record.data : new DataView(record.data);
    return new TextDecoder().decode(view);
  } catch {
    return '(binary data)';
  }
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Permission denied for NFC access.';
    if (err.name === 'NotSupportedError') {
      return 'NFC is not supported on this device (requires Chrome on Android with NFC hardware).';
    }
    if (err.name === 'NotReadableError')
      return 'NFC hardware could not be read (is it turned on?).';
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

interface ReadingRecord {
  id: string;
  text: string;
}

interface ReadingResult {
  id: string;
  serialNumber: string;
  records: ReadingRecord[];
}

export default function WebNfcDemo() {
  const [scanning, setScanning] = useState(false);
  const [readings, setReadings] = useState<ReadingResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleScan = async () => {
    setError(null);
    setStatus(null);
    try {
      const NDEFReader = getNDEFReaderConstructor();
      const reader = new NDEFReader();
      const controller = new AbortController();
      abortRef.current = controller;

      reader.onreading = (event) => {
        const records = event.message.records.map((record) => ({
          id: crypto.randomUUID(),
          text: decodeRecord(record),
        }));
        setReadings((prev) =>
          [
            { id: crypto.randomUUID(), serialNumber: event.serialNumber || '(unknown)', records },
            ...prev,
          ].slice(0, 10),
        );
      };
      reader.onreadingerror = () => {
        setError('Error reading an NFC tag. Try holding it steadier against the device.');
      };

      await reader.scan({ signal: controller.signal });
      setScanning(true);
      setStatus('Scanning for NFC tags. Bring a tag near the device.');
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setScanning(false);
    setStatus('Scan stopped.');
  };

  const handleWrite = async () => {
    setError(null);
    try {
      const NDEFReader = getNDEFReaderConstructor();
      const reader = new NDEFReader();
      await reader.write('Hello from WebCanDoIt');
      setStatus('Wrote text record to the tag.');
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Web NFC only works on Chrome for Android with NFC enabled, over HTTPS, and needs a user
        gesture plus a physical NFC tag nearby.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!scanning ? (
          <button type="button" onClick={handleScan}>
            Start scan
          </button>
        ) : (
          <button type="button" onClick={handleStop}>
            Stop scan
          </button>
        )}
        <button type="button" onClick={handleWrite}>
          Write "Hello from WebCanDoIt"
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status && <div role="status">{status}</div>}
      {readings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {readings.map((reading) => (
            <div
              key={reading.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
              }}
            >
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Serial: {reading.serialNumber}
              </div>
              {reading.records.map((record) => (
                <div key={record.id}>{record.text}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
