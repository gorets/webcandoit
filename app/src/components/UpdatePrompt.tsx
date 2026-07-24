import { registerSW } from 'virtual:pwa-register';
import { useEffect, useState } from 'react';
import './UpdatePrompt.css';

// Bridges the service worker's "new version waiting" state to a UI banner.
// `registerType: 'prompt'` in vite.config keeps the freshly installed worker in
// `waiting` until the user opts in; clicking Reload calls updateSW(true), which
// posts SKIP_WAITING (handled in sw.ts) and reloads once the new worker takes over.
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    // Store the updater behind a function so setState doesn't invoke it.
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="update-prompt" role="alert">
      <span className="update-prompt-text">A new version is available.</span>
      <div className="update-prompt-actions">
        <button type="button" onClick={() => void updateSW?.(true)}>
          Reload
        </button>
        <button
          type="button"
          className="update-prompt-dismiss"
          onClick={() => setNeedRefresh(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
