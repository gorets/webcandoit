import { useEffect, useRef, useState } from 'react';

interface USBDeviceLike extends EventTarget {
  opened: boolean;
  productName?: string;
  manufacturerName?: string;
  vendorId: number;
  productId: number;
  open: () => Promise<void>;
  close: () => Promise<void>;
}

interface USBLike {
  requestDevice: (options: { filters: unknown[] }) => Promise<USBDeviceLike>;
}

function getUsb(): USBLike {
  return (navigator as Navigator & { usb: USBLike }).usb;
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

export default function WebUsbDemo() {
  const [device, setDevice] = useState<USBDeviceLike | null>(null);
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceRef = useRef<USBDeviceLike | null>(null);

  useEffect(() => {
    return () => {
      const d = deviceRef.current;
      if (d?.opened) {
        d.close().catch(() => {});
      }
    };
  }, []);

  const handleRequest = async () => {
    setError(null);
    setStatus(null);
    setOpened(false);
    try {
      const found = await getUsb().requestDevice({ filters: [] });
      deviceRef.current = found;
      setDevice(found);
      setStatus('Device selected.');
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleOpen = async () => {
    setError(null);
    try {
      await deviceRef.current?.open();
      setOpened(true);
      setStatus('Device opened.');
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleClose = async () => {
    setError(null);
    try {
      await deviceRef.current?.close();
      setOpened(false);
      setStatus('Device closed.');
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        This opens the browser's USB device chooser. It requires a physical USB device that isn't
        claimed by another driver, and a user gesture.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleRequest}>
          Request USB device
        </button>
        {device && !opened && (
          <button type="button" onClick={handleOpen}>
            Open device
          </button>
        )}
        {device && opened && (
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
      {device && (
        <div
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
        >
          <strong>{device.productName || '(unnamed device)'}</strong>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            {device.manufacturerName || '(unknown manufacturer)'}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Vendor: {toHex(device.vendorId)}, Product: {toHex(device.productId)}
          </div>
        </div>
      )}
    </div>
  );
}
