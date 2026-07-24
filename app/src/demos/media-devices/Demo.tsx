import { useCallback, useEffect, useState } from 'react';

const KIND_LABELS: Record<MediaDeviceKind, string> = {
  audioinput: 'Microphones',
  audiooutput: 'Speakers',
  videoinput: 'Cameras',
};

const KIND_ORDER: MediaDeviceKind[] = ['videoinput', 'audioinput', 'audiooutput'];

export default function MediaDevicesDemo() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [labelsHidden, setLabelsHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list);
      // Labels are only populated once the user has granted camera/mic access.
      setLabelsHidden(list.length > 0 && list.every((d) => d.label === ''));
    } catch {
      setError('Could not enumerate media devices.');
    }
  }, []);

  useEffect(() => {
    refresh();
    navigator.mediaDevices.addEventListener('devicechange', refresh);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refresh);
    };
  }, [refresh]);

  const requestPermission = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      // We only wanted the permission grant, not the stream itself.
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      await refresh();
    } catch {
      setError('Permission was denied, so device labels stay hidden.');
    }
  };

  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: devices.filter((d) => d.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        The browser lists every input and output device. Labels stay empty until you grant
        camera/microphone access, and the list updates live when you plug or unplug a device.
      </p>

      {labelsHidden && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={requestPermission}>
            Grant access to reveal labels
          </button>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Labels are hidden for privacy.
          </span>
        </div>
      )}

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {grouped.length === 0 ? (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          No media devices detected.
        </div>
      ) : (
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {grouped.map((group) => (
            <div key={group.kind}>
              <div
                style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}
              >
                {KIND_LABELS[group.kind]} ({group.items.length})
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {group.items.map((device, index) => (
                  <li key={device.deviceId || `${group.kind}-${index}`}>
                    {device.label || `${KIND_LABELS[group.kind].slice(0, -1)} ${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
