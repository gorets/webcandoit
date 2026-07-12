import { useEffect, useRef, useState } from 'react';

interface BluetoothRemoteGATTCharacteristicLike extends EventTarget {
  readValue: () => Promise<DataView>;
}

interface BluetoothRemoteGATTServiceLike {
  getCharacteristic: (characteristic: string) => Promise<BluetoothRemoteGATTCharacteristicLike>;
}

interface BluetoothRemoteGATTServerLike {
  connected: boolean;
  connect: () => Promise<BluetoothRemoteGATTServerLike>;
  disconnect: () => void;
  getPrimaryService: (service: string) => Promise<BluetoothRemoteGATTServiceLike>;
}

interface BluetoothDeviceLike extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServerLike;
}

interface BluetoothLike {
  requestDevice: (options: {
    acceptAllDevices?: boolean;
    optionalServices?: string[];
  }) => Promise<BluetoothDeviceLike>;
}

function getBluetooth(): BluetoothLike {
  return (navigator as Navigator & { bluetooth: BluetoothLike }).bluetooth;
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotFoundError') return 'No device selected.';
    if (err.name === 'SecurityError') {
      return 'Blocked by browser security policy (requires a user gesture, HTTPS, and permission).';
    }
    if (err.name === 'NetworkError') {
      return 'Could not connect to the device (it may be out of range or already connected elsewhere).';
    }
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

export default function WebBluetoothDemo() {
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceRef = useRef<BluetoothDeviceLike | null>(null);

  useEffect(() => {
    return () => {
      const device = deviceRef.current;
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      }
    };
  }, []);

  const handleRequest = async () => {
    setError(null);
    setStatus(null);
    setBatteryLevel(null);
    setConnected(false);
    try {
      const device = await getBluetooth().requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });
      deviceRef.current = device;
      setDeviceName(device.name ?? '(unnamed device)');
      setDeviceId(device.id);
      setStatus('Device selected. Attempting to connect…');

      if (!device.gatt) {
        setStatus('Device selected, but GATT is not available on this device.');
        return;
      }

      const server = await device.gatt.connect();
      setConnected(true);
      setStatus('Connected via GATT.');

      try {
        const service = await server.getPrimaryService('battery_service');
        const characteristic = await service.getCharacteristic('battery_level');
        const value = await characteristic.readValue();
        setBatteryLevel(value.getUint8(0));
      } catch {
        setStatus('Connected, but no battery service was found on this device.');
      }
    } catch (err) {
      setError(describeError(err));
    }
  };

  const handleDisconnect = () => {
    const device = deviceRef.current;
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setConnected(false);
    setStatus('Disconnected.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        This opens the browser's native Bluetooth device chooser. It requires a physical Bluetooth
        device nearby and a user gesture (click the button below).
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleRequest}>
          Request Bluetooth device
        </button>
        {connected && (
          <button type="button" onClick={handleDisconnect}>
            Disconnect
          </button>
        )}
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {(deviceName || status) && (
        <div
          role="status"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
        >
          {deviceName && (
            <div>
              <strong>{deviceName}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{deviceId}</div>
            </div>
          )}
          {status && <div style={{ marginTop: '0.5rem' }}>{status}</div>}
          {batteryLevel !== null && (
            <div style={{ marginTop: '0.5rem' }}>Battery level: {batteryLevel}%</div>
          )}
        </div>
      )}
    </div>
  );
}
