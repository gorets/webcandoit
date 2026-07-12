import { useEffect, useRef, useState } from 'react';

interface SerialPortInfoLike {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPortLike {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  getInfo: () => SerialPortInfoLike;
}

interface SerialLike {
  requestPort: () => Promise<SerialPortLike>;
}

function getSerial(): SerialLike {
  return (navigator as Navigator & { serial: SerialLike }).serial;
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotFoundError') return 'No port selected.';
    if (err.name === 'SecurityError') return 'Blocked by browser security policy.';
    if (err.name === 'NetworkError') {
      return 'Could not open the port (it may be in use by another application).';
    }
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function toHex(id: number | undefined): string {
  return id === undefined ? '—' : `0x${id.toString(16).padStart(4, '0')}`;
}

export default function WebSerialDemo() {
  const [info, setInfo] = useState<SerialPortInfoLike | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [received, setReceived] = useState<string | null>(null);
  const portRef = useRef<SerialPortLike | null>(null);

  useEffect(() => {
    return () => {
      portRef.current?.close().catch(() => {});
    };
  }, []);

  const handleRequest = async () => {
    setError(null);
    setStatus(null);
    setReceived(null);
    try {
      const port = await getSerial().requestPort();
      portRef.current = port;
      setInfo(port.getInfo());
      setStatus('Port selected. Opening at 9600 baud…');

      await port.open({ baudRate: 9600 });
      setStatus('Port open. Reading for up to 3 seconds…');

      const reader = port.readable?.getReader();
      if (!reader) {
        setStatus('Port open, but no readable stream is available.');
        return;
      }

      const timeout = new Promise<'timeout'>((resolve) => {
        setTimeout(() => resolve('timeout'), 3000);
      });
      const result = await Promise.race([reader.read(), timeout]);

      if (result === 'timeout') {
        await reader.cancel().catch(() => {});
        setStatus('Port open. No data received within 3 seconds.');
      } else if (result.done) {
        setStatus('Port open. Stream closed before any data arrived.');
      } else {
        setReceived(new TextDecoder().decode(result.value));
        setStatus('Received data from the port.');
      }
      reader.releaseLock();
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleClose = async () => {
    setError(null);
    try {
      await portRef.current?.close();
      setStatus('Port closed.');
      portRef.current = null;
      setInfo(null);
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        This opens the browser's serial port chooser. It requires a physical serial device (e.g. a
        USB-to-serial adapter or microcontroller) and a user gesture.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleRequest}>
          Request serial port
        </button>
        {info && (
          <button type="button" onClick={handleClose}>
            Close port
          </button>
        )}
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {(info || status) && (
        <div
          role="status"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
        >
          {info && (
            <div>
              Vendor ID: {toHex(info.usbVendorId)}, Product ID: {toHex(info.usbProductId)}
            </div>
          )}
          {status && <div style={{ marginTop: '0.5rem' }}>{status}</div>}
          {received && <div style={{ marginTop: '0.5rem' }}>Data: {received}</div>}
        </div>
      )}
    </div>
  );
}
