import { useCallback, useEffect, useRef, useState } from 'react';

const TARGET_URL = '/demo/vibration';

const RULES = {
  prerender: [{ urls: [TARGET_URL] }],
};

const RULES_JSON = JSON.stringify(RULES, null, 2);

export default function SpeculationRulesDemo() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [injected, setInjected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeScript = useCallback(() => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    setInjected(false);
  }, []);

  useEffect(() => removeScript, [removeScript]);

  const inject = () => {
    setError(null);
    try {
      const script = document.createElement('script');
      script.type = 'speculationrules';
      script.textContent = RULES_JSON;
      document.head.appendChild(script);
      scriptRef.current = script;
      setInjected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not inject speculation rules.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Injects a <code>&lt;script type="speculationrules"&gt;</code> tag into the document head,
        hinting the browser it may prerender <code>{TARGET_URL}</code> in the background so
        navigating there feels instant. The browser decides whether to act on the hint — there is no
        way to observe or force it from the page.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={inject} disabled={injected}>
          Inject speculation rules
        </button>
        <button type="button" onClick={removeScript} disabled={!injected}>
          Remove rules
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      <pre
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          overflowX: 'auto',
          margin: 0,
        }}
      >
        {RULES_JSON}
      </pre>
      <p style={{ color: 'var(--text-dim)' }}>
        {injected
          ? 'The rules script is currently in the document head.'
          : 'No speculation rules are currently injected.'}
      </p>
    </div>
  );
}
