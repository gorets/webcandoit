import { useEffect, useState } from 'react';

export default function PageFocusDemo() {
  const [focused, setFocused] = useState(() => document.hasFocus());
  const [focusCount, setFocusCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);

  useEffect(() => {
    function handleFocus() {
      setFocused(true);
      setFocusCount((count) => count + 1);
    }
    function handleBlur() {
      setFocused(false);
      setBlurCount((count) => count + 1);
    }

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div>
      <p>
        Click into another window (or the address bar, or a devtools panel) and back. The window
        loses focus while staying visible — something the Page Visibility API cannot detect.
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
          Window is{' '}
          <strong style={{ color: focused ? 'var(--accent)' : 'var(--danger)' }}>
            {focused ? 'focused' : 'not focused'}
          </strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Focus events: <strong>{focusCount}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Blur events: <strong>{blurCount}</strong>
        </p>
      </div>
    </div>
  );
}
