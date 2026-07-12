import { useEffect, useRef, useState } from 'react';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

function describeError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission was denied. Allow location access in your browser settings and try again.';
    case err.POSITION_UNAVAILABLE:
      return 'Location information is currently unavailable.';
    case err.TIMEOUT:
      return 'The request to get your location timed out. Try again.';
    default:
      return 'Could not determine your location.';
  }
}

function toPosition(pos: GeolocationPosition): Position {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: pos.timestamp,
  };
}

export default function GeolocationDemo() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const getOnce = () => {
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(toPosition(pos));
        setLoading(false);
      },
      (err) => {
        setError(describeError(err));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const toggleWatch = () => {
    if (watching) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setWatching(false);
      return;
    }

    setError(null);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(toPosition(pos));
      },
      (err) => {
        setError(describeError(err));
        setWatching(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    watchIdRef.current = id;
    setWatching(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Reads the device's current position with <code>getCurrentPosition</code>, or continuously
        tracks it with <code>watchPosition</code>.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={getOnce} disabled={loading || watching}>
          {loading ? 'Locating…' : 'Get current position'}
        </button>
        <button type="button" onClick={toggleWatch}>
          {watching ? 'Stop watching' : 'Watch position'}
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {position && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
          }}
        >
          <p style={{ margin: 0 }}>
            Latitude: <strong>{position.latitude.toFixed(6)}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            Longitude: <strong>{position.longitude.toFixed(6)}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            Accuracy: <strong>{Math.round(position.accuracy)} m</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)' }}>
            Updated: {new Date(position.timestamp).toLocaleTimeString()}
            {watching ? ' (watching)' : ''}
          </p>
        </div>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9em' }}>
        Note: "Geofencing" (triggering callbacks when entering/leaving a region in the background)
        is not a shipping web API in any browser — this demo only covers point-in-time and
        continuous position reads.
      </p>
    </div>
  );
}
