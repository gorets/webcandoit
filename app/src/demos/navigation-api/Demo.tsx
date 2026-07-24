import { useEffect, useState } from 'react';

// The Navigation API is not yet in TypeScript's lib.dom; describe what we read.
interface NavigationHistoryEntryLike {
  url: string | null;
  index: number;
  key: string;
}
interface NavigationLike extends EventTarget {
  currentEntry: NavigationHistoryEntryLike | null;
  entries: () => NavigationHistoryEntryLike[];
  canGoBack: boolean;
  canGoForward: boolean;
  back: () => void;
  forward: () => void;
}

interface State {
  url: string;
  index: number;
  total: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

function getNavigation(): NavigationLike {
  return (window as unknown as { navigation: NavigationLike }).navigation;
}

export default function NavigationApiDemo() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const navigation = getNavigation();
    const update = () => {
      const current = navigation.currentEntry;
      setState({
        url: current?.url ? new URL(current.url).pathname : '(unknown)',
        index: current?.index ?? -1,
        total: navigation.entries().length,
        canGoBack: navigation.canGoBack,
        canGoForward: navigation.canGoForward,
      });
    };
    update();
    navigation.addEventListener('currententrychange', update);
    return () => navigation.removeEventListener('currententrychange', update);
  }, []);

  if (!state) return <div role="status">Reading navigation state…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Navigate the app (open a demo, use the browser back button) and watch the live session
        history. Every entry is enumerable — something the old History API never exposed.
      </p>
      <div
        role="status"
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
      >
        <p style={{ margin: 0 }}>
          Current path: <strong>{state.url}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Entry <strong>{state.index + 1}</strong> of <strong>{state.total}</strong>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={() => getNavigation().back()} disabled={!state.canGoBack}>
          ← Back
        </button>
        <button
          type="button"
          onClick={() => getNavigation().forward()}
          disabled={!state.canGoForward}
        >
          Forward →
        </button>
      </div>
    </div>
  );
}
