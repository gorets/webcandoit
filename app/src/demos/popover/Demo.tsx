import { useEffect, useRef, useState } from 'react';

export default function PopoverDemo() {
  const [popoverState, setPopoverState] = useState<'open' | 'closed'>('closed');
  const manualPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = manualPopoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const toggleEvent = event as Event & { newState: string };
      setPopoverState(toggleEvent.newState === 'open' ? 'open' : 'closed');
    };

    popover.addEventListener('toggle', handleToggle);

    return () => {
      popover.removeEventListener('toggle', handleToggle);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.95rem' }}>
          Declarative: popovertarget attribute
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" popoverTarget="declarative-popover" popoverTargetAction="toggle">
            Toggle popover
          </button>
        </div>
        <div
          id="declarative-popover"
          popover="auto"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text)' }}>
            This is a declarative popover using the popovertarget attribute. Click outside to
            dismiss.
          </p>
          <button
            type="button"
            popoverTarget="declarative-popover"
            popoverTargetAction="hide"
            style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
          >
            Close
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.95rem' }}>
          Imperative: showPopover/hidePopover
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => manualPopoverRef.current?.showPopover()}>
            Show popover
          </button>
          <button type="button" onClick={() => manualPopoverRef.current?.hidePopover()}>
            Hide popover
          </button>
        </div>
        <div
          ref={manualPopoverRef}
          popover="manual"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text)' }}>
            This is a manual popover. You must explicitly close it with the button.
          </p>
          <button
            type="button"
            onClick={() => manualPopoverRef.current?.hidePopover()}
            style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
          >
            Close
          </button>
        </div>
      </div>

      <div
        role="status"
        style={{
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          color: 'var(--text)',
        }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Manual popover state</div>
        <div>{popoverState === 'open' ? 'Open' : 'Closed'}</div>
      </div>
    </div>
  );
}
