import { useEffect, useRef, useState } from 'react';

export default function WebAnimationsDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const animation = box.animate(
      [
        { transform: 'translateX(0) rotate(0deg)', background: 'var(--accent)' },
        { transform: 'translateX(220px) rotate(180deg)', background: 'var(--danger)' },
        { transform: 'translateX(0) rotate(360deg)', background: 'var(--accent)' },
      ],
      { duration: 2500, iterations: Number.POSITIVE_INFINITY, easing: 'ease-in-out' },
    );
    animationRef.current = animation;
    return () => animation.cancel();
  }, []);

  const changeRate = (value: number) => {
    setRate(value);
    if (animationRef.current) animationRef.current.playbackRate = value;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        This box is animated entirely from JavaScript. Control it at runtime — pause, reverse, or
        change its speed on the fly.
      </p>
      <div style={{ overflow: 'hidden', padding: '0.5rem 0' }}>
        <div
          ref={boxRef}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius)',
            background: 'var(--accent)',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => animationRef.current?.play()}>
          Play
        </button>
        <button type="button" onClick={() => animationRef.current?.pause()}>
          Pause
        </button>
        <button type="button" onClick={() => animationRef.current?.reverse()}>
          Reverse
        </button>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Playback rate: {rate.toFixed(1)}×
        </span>
        <input
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={rate}
          onChange={(event) => changeRate(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
