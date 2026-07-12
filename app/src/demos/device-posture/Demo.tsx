import { useEffect, useState } from 'react';

type PostureType = 'continuous' | 'folded';

interface DevicePostureLike extends EventTarget {
  type: PostureType;
}

export default function DevicePostureDemo() {
  const [posture, setPosture] = useState<PostureType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const devicePosture = (navigator as Navigator & { devicePosture?: DevicePostureLike })
      .devicePosture;

    if (!devicePosture) {
      setError('The Device Posture API is not available in this browser.');
      return;
    }

    const update = () => setPosture(devicePosture.type);
    update();
    devicePosture.addEventListener('change', update);

    return () => {
      devicePosture.removeEventListener('change', update);
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
    >
      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Current posture</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
        {posture ?? 'Detecting…'}
      </div>
      {posture === 'folded' && (
        <div style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Device is folded — e.g. a dual-screen or foldable device in book/tent mode.
        </div>
      )}
    </div>
  );
}
