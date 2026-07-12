import { useEffect, useRef, useState } from 'react';

interface HIDReportItemLike {
  reportId?: number;
}

interface HIDCollectionInfoLike {
  usage?: number;
  usagePage?: number;
  inputReports?: HIDReportItemLike[];
  outputReports?: HIDReportItemLike[];
  featureReports?: HIDReportItemLike[];
}

interface HIDDeviceLike extends EventTarget {
  opened: boolean;
  productName: string;
  vendorId: number;
  productId: number;
  collections: HIDCollectionInfoLike[];
  open: () => Promise<void>;
  close: () => Promise<void>;
}

interface HIDLike {
  requestDevice: (options: { filters: unknown[] }) => Promise<HIDDeviceLike[]>;
}

function getHid(): HIDLike {
  return (navigator as Navigator & { hid: HIDLike }).hid;
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotFoundError') return 'No device selected.';
    if (err.name === 'SecurityError') return 'Blocked by browser security policy.';
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function toHex(id: number): string {
  return `0x${id.toString(16).padStart(4, '0')}`;
}

export default function WebHidDemo() {
  const [devices, setDevices] = useState<HIDDeviceLike[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openedRef = useRef<HIDDeviceLike | null>(null);

  useEffect(() => {
    return () => {
      if (openedRef.current?.opened) {
        openedRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleRequest = async () => {
    setError(null);
    setStatus(null);
    try {
      const found = await getHid().requestDevice({ filters: [] });
      if (found.length === 0) {
        setStatus('No device selected.');
        return;
      }
      setDevices(found);

      const [first] = found;
      await first.open();
      openedRef.current = first;
      setStatus(`Opened "${first.productName || '(unnamed device)'}".`);
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleClose = async () => {
    setError(null);
    try {
      if (openedRef.current?.opened) {
        await openedRef.current.close();
      }
      setStatus('Device closed.');
      openedRef.current = null;
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        This opens the browser's HID device chooser. It requires a physical HID device (e.g. a
        gamepad, keyboard, or specialty controller) and a user gesture.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleRequest}>
          Request HID device
        </button>
        {devices.length > 0 && (
          <button type="button" onClick={handleClose}>
            Close device
          </button>
        )}
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status && <div role="status">{status}</div>}
      {devices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {devices.map((device) => (
            <div
              key={`${device.vendorId}-${device.productId}-${device.productName}`}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
              }}
            >
              <strong>{device.productName || '(unnamed device)'}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Vendor: {toHex(device.vendorId)}, Product: {toHex(device.productId)}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                {device.collections.length} report collection(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
