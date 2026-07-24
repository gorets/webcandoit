import { useCallback, useEffect, useRef, useState } from 'react';

function getAudioContextCtor(): typeof AudioContext {
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

export default function WebAudioDemo() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.2);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    oscRef.current?.stop();
    oscRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const draw = () => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.lineWidth = 2;
    ctx2d.strokeStyle = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#22c55e';
    ctx2d.beginPath();
    const slice = canvas.width / data.length;
    for (let i = 0; i < data.length; i++) {
      const y = (data[i] / 255) * canvas.height;
      const x = i * slice;
      if (i === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();
    rafRef.current = requestAnimationFrame(draw);
  };

  const start = async () => {
    const AudioCtx = getAudioContextCtor();
    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;
    // Browsers start the context suspended until a user gesture resumes it.
    await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
    analyserRef.current = analyser;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (oscRef.current && ctxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, ctxRef.current.currentTime);
    }
  }, [frequency]);

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, ctxRef.current.currentTime);
    }
  }, [volume]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Start the oscillator and drag the sliders — pitch and loudness update live, and the wave is
        drawn from an AnalyserNode. Mind your volume.
      </p>
      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={playing}>
          Play tone
        </button>
        <button type="button" onClick={stop} disabled={!playing}>
          Stop
        </button>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Frequency: {frequency} Hz
        </span>
        <input
          type="range"
          min={100}
          max={2000}
          step={1}
          value={frequency}
          onChange={(event) => setFrequency(Number(event.target.value))}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Volume: {Math.round(volume * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
