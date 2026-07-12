export default function DeviceMemoryDemo() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  if (memory === undefined) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        Device memory information is not available in this browser.
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
    >
      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{memory} GB</div>
      <div style={{ color: 'var(--text-dim)' }}>
        Approximate device memory, rounded down to the nearest power of two for privacy.
      </div>
    </div>
  );
}
