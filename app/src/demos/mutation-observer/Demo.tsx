import { useEffect, useRef, useState } from 'react';

export default function MutationObserverDemo() {
  // The observed subtree is managed imperatively so React's reconciler does not
  // compete with the mutations we make by hand.
  const targetRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const observer = new MutationObserver((records) => {
      const lines = records.map((record) => {
        if (record.type === 'childList') {
          if (record.addedNodes.length) return `added ${record.addedNodes.length} node(s)`;
          if (record.removedNodes.length) return `removed ${record.removedNodes.length} node(s)`;
        }
        if (record.type === 'attributes') return `attribute "${record.attributeName}" changed`;
        if (record.type === 'characterData') return 'text changed';
        return record.type;
      });
      setLog((prev) => [...lines.reverse(), ...prev].slice(0, 20));
    });
    observer.observe(target, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  const addItem = () => {
    const item = document.createElement('div');
    item.textContent = `Item ${++counter.current}`;
    item.style.padding = '0.3rem 0.5rem';
    targetRef.current?.append(item);
  };

  const removeItem = () => {
    targetRef.current?.lastElementChild?.remove();
  };

  const editItem = () => {
    const last = targetRef.current?.lastElementChild as HTMLElement | null;
    if (last) last.textContent = `${last.textContent} (edited)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Add, remove, or edit nodes in the box. The observer receives a batched record of every DOM
        change.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={addItem}>
          Add node
        </button>
        <button type="button" onClick={removeItem}>
          Remove node
        </button>
        <button type="button" onClick={editItem}>
          Edit last node
        </button>
      </div>
      <div
        ref={targetRef}
        style={{
          minHeight: '60px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem',
        }}
      />
      <div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
          Mutation log
        </div>
        <ul role="status" style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-dim)' }}>
          {log.length === 0 ? (
            <li>No mutations yet.</li>
          ) : (
            log.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only log
              <li key={index}>{line}</li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
