import { useEffect, useRef, useState } from 'react';

interface LifecycleEvent {
  id: number;
  type: string;
  time: string;
}

// The Page Lifecycle API's `freeze`/`resume` events and `document.wasDiscarded`
// are not part of TypeScript's bundled DOM lib, so we describe the minimal
// shape we need locally and cast at the call sites.
type LifecycleDocument = Document & {
  addEventListener(type: 'freeze' | 'resume', listener: () => void): void;
  removeEventListener(type: 'freeze' | 'resume', listener: () => void): void;
  wasDiscarded?: boolean;
};

export default function PageLifecycleDemo() {
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const logRef = useRef<LifecycleEvent[]>([]);
  const nextIdRef = useRef(0);

  const wasDiscarded = (document as LifecycleDocument).wasDiscarded === true;

  useEffect(() => {
    const lifecycleDocument = document as LifecycleDocument;

    function log(type: string) {
      const entry = { id: nextIdRef.current++, type, time: new Date().toLocaleTimeString() };
      logRef.current = [entry, ...logRef.current].slice(0, 20);
      setEvents(logRef.current);
    }

    function handleFreeze() {
      log('freeze');
    }
    function handleResume() {
      log('resume');
    }
    function handlePageHide(event: PageTransitionEvent) {
      log(event.persisted ? 'pagehide (persisted)' : 'pagehide');
    }
    function handlePageShow(event: PageTransitionEvent) {
      log(event.persisted ? 'pageshow (persisted)' : 'pageshow');
    }

    lifecycleDocument.addEventListener('freeze', handleFreeze);
    lifecycleDocument.addEventListener('resume', handleResume);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      lifecycleDocument.removeEventListener('freeze', handleFreeze);
      lifecycleDocument.removeEventListener('resume', handleResume);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return (
    <div>
      <p>
        The Page Lifecycle API reports when a background tab is frozen or resumed by the browser to
        save resources. Switch tabs, minimize the browser, or leave this tab in the background for a
        while to see events appear below.
      </p>
      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          marginTop: '1rem',
        }}
      >
        <p style={{ margin: 0 }}>
          document.wasDiscarded: <strong>{String(wasDiscarded)}</strong>
        </p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Event history</h3>
        {events.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No lifecycle events observed yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {events.map((entry) => (
              <li
                key={entry.id}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.3rem',
                }}
              >
                <strong>{entry.type}</strong> — {entry.time}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
