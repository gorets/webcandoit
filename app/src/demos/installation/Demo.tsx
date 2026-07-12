import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

interface RelatedApplication {
  id?: string;
  platform: string;
  url?: string;
}

interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<RelatedApplication[]>;
}

function isStandalone(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
}

export default function InstallationDemo() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedApps, setRelatedApps] = useState<RelatedApplication[] | null>(null);
  const [standalone, setStandalone] = useState(isStandalone());

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setOutcome('The app was installed.');
    };
    const media = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => setStandalone(media.matches);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    media.addEventListener('change', onDisplayModeChange);

    const nav = navigator as NavigatorWithRelatedApps;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      nav
        .getInstalledRelatedApps()
        .then(setRelatedApps)
        .catch(() => setRelatedApps([]));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      media.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  const install = async () => {
    setError(null);
    setOutcome(null);
    if (!deferredPrompt) {
      setError('No install prompt is available right now.');
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setOutcome(
        choice.outcome === 'accepted'
          ? 'User accepted the install prompt.'
          : 'User dismissed the install prompt.',
      );
      setDeferredPrompt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not show the install prompt.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Browser support for triggering installation varies widely — Chromium-based browsers fire{' '}
        <code>beforeinstallprompt</code>, Safari and Firefox rely on user-initiated menu flows
        instead and never fire it. If the button below stays disabled, that is expected on those
        browsers.
      </p>
      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <span>
          Running as installed app: <strong>{standalone ? 'yes' : 'no'}</strong>
        </span>
        <span>
          Install prompt available: <strong>{deferredPrompt ? 'yes' : 'no'}</strong>
        </span>
        {relatedApps !== null && (
          <span>
            Installed related apps:{' '}
            <strong>
              {relatedApps.length > 0
                ? relatedApps.map((app) => app.platform).join(', ')
                : 'none reported'}
            </strong>
          </span>
        )}
      </div>
      <div>
        <button type="button" onClick={install} disabled={!deferredPrompt}>
          Install app
        </button>
      </div>
      {outcome && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {outcome}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
