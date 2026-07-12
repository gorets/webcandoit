import { useEffect, useState } from 'react';

interface LaunchParamsLike {
  targetURL: string;
  files: unknown[];
}

interface LaunchQueueLike {
  setConsumer: (consumer: (params: LaunchParamsLike) => void) => void;
}

interface LaunchQueueWindow extends Window {
  launchQueue: LaunchQueueLike;
}

const MANIFEST_SNIPPET = `{
  "launch_handler": {
    "client_mode": "focus-existing"
  }
}`;

export default function LaunchHandlerDemo() {
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [launchCount, setLaunchCount] = useState(0);

  useEffect(() => {
    const launchQueue = (window as unknown as LaunchQueueWindow).launchQueue;
    if (!launchQueue) return;

    launchQueue.setConsumer((params) => {
      setTargetUrl(params.targetURL);
      setLaunchCount((count) => count + 1);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        The Launch Handler API lets an installed PWA control how it behaves when it is re-launched
        (from a link, shortcut, or notification) while already open. The manifest's{' '}
        <code>launch_handler.client_mode</code> declares the policy:
      </p>
      <ul style={{ color: 'var(--text-dim)', paddingLeft: '1.25rem', margin: 0 }}>
        <li>
          <code>navigate-new</code> — always open a new window
        </li>
        <li>
          <code>navigate-existing</code> — reuse the existing window and navigate it
        </li>
        <li>
          <code>focus-existing</code> — reuse the existing window without navigating it
        </li>
        <li>
          <code>auto</code> — browser picks a sensible default
        </li>
      </ul>
      <pre
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          overflowX: 'auto',
          fontSize: '0.85rem',
        }}
      >
        {MANIFEST_SNIPPET}
      </pre>
      <p style={{ color: 'var(--text-dim)' }}>
        Whichever mode is used, the app observes the launch via{' '}
        <code>window.launchQueue.setConsumer()</code>, which receives a <code>LaunchParams</code>{' '}
        object with the target URL (and any launched files — see the separate File Handling demo).
      </p>
      <div
        role="status"
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
      >
        {launchCount === 0 ? (
          <span>
            No launch has been observed yet in this session. This page was opened normally, so
            nothing is queued. To see it fire, install the app, then re-launch it (e.g. via a
            shortcut) while it is already open.
          </span>
        ) : (
          <span>
            Observed {launchCount} launch{launchCount === 1 ? '' : 'es'}. Latest target URL:{' '}
            <strong>{targetUrl}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
