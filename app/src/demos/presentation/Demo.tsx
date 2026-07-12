import { useCallback, useEffect, useRef, useState } from 'react';

interface PresentationConnectionLike extends EventTarget {
  id: string;
  url: string;
  close: () => void;
  terminate: () => void;
}

interface PresentationAvailabilityLike extends EventTarget {
  value: boolean;
}

interface PresentationRequestLike extends EventTarget {
  start: () => Promise<PresentationConnectionLike>;
  getAvailability: () => Promise<PresentationAvailabilityLike>;
}

interface PresentationRequestConstructor {
  new (urls: string | string[]): PresentationRequestLike;
}

// A placeholder receiver URL — no real receiver app is hosted here. This is
// enough to demonstrate device discovery and the native connection picker;
// actually casting content would require a deployed receiver page.
const RECEIVER_URL = 'https://example.com/receiver.html';

export default function PresentationDemo() {
  const requestRef = useRef<PresentationRequestLike | null>(null);
  const connectionRef = useRef<PresentationConnectionLike | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const PresentationRequestCtor = (
      window as unknown as { PresentationRequest: PresentationRequestConstructor }
    ).PresentationRequest;
    const request = new PresentationRequestCtor([RECEIVER_URL]);
    requestRef.current = request;

    let cancelled = false;
    let availability: PresentationAvailabilityLike | null = null;
    const handleChange = () => {
      if (!cancelled && availability) setAvailable(availability.value);
    };

    request
      .getAvailability()
      .then((result) => {
        if (cancelled) return;
        availability = result;
        setAvailable(result.value);
        availability.addEventListener('change', handleChange);
      })
      .catch(() => {
        // Availability monitoring isn't supported everywhere; the Start
        // button still works and opens the native device picker.
        if (!cancelled) setAvailable(null);
      });

    return () => {
      cancelled = true;
      availability?.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(
    () => () => {
      connectionRef.current?.terminate();
    },
    [],
  );

  const startCasting = useCallback(async () => {
    setError(null);
    const request = requestRef.current;
    if (!request) return;
    try {
      const connection = await request.start();
      connectionRef.current = connection;
      setConnected(true);
      const handleClose = () => {
        connectionRef.current = null;
        setConnected(false);
      };
      connection.addEventListener('close', handleClose);
      connection.addEventListener('terminate', handleClose);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No casting devices were found.');
      } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('The casting request was cancelled.');
      } else {
        setError('Could not start a presentation session.');
      }
    }
  }, []);

  const stopCasting = useCallback(() => {
    connectionRef.current?.terminate();
    connectionRef.current = null;
    setConnected(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={startCasting} disabled={connected}>
          Start casting
        </button>
        <button type="button" onClick={stopCasting} disabled={!connected}>
          Stop casting
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {connected
            ? 'Connected to a presentation display.'
            : available === null
              ? 'Device availability unknown — press Start to open the device picker.'
              : available
                ? 'A casting device is available nearby.'
                : 'No casting devices detected nearby.'}
        </div>
      )}
    </div>
  );
}
