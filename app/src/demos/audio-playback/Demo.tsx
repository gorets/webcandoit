import { useEffect, useRef, useState } from 'react';

/** Encode a mono/stereo AudioBuffer as a 16-bit PCM WAV Blob. */
function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/** Render a short sine-wave tone entirely offline and return an object URL for it. */
async function createToneUrl(): Promise<string> {
  const duration = 1.2;
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

  const oscillator = offlineCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440;

  const gain = offlineCtx.createGain();
  gain.gain.value = 0.2;

  oscillator.connect(gain);
  gain.connect(offlineCtx.destination);
  oscillator.start(0);
  oscillator.stop(duration);

  const rendered = await offlineCtx.startRendering();
  return URL.createObjectURL(encodeWav(rendered));
}

export default function AudioPlaybackDemo() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    createToneUrl()
      .then((generatedUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(generatedUrl);
          return;
        }
        urlRef.current = generatedUrl;
        setUrl(generatedUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not generate the demo tone in this browser.');
        }
      });

    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !url) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Generated Tone',
      artist: 'whatpwacando.today',
      album: 'Media Session demo',
    });

    const audio = audioRef.current;
    navigator.mediaSession.setActionHandler('play', () => audio?.play());
    navigator.mediaSession.setActionHandler('pause', () => audio?.pause());
    navigator.mediaSession.setActionHandler('stop', () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [url]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Play the generated tone below, then check your OS media controls (lock screen, notification
        shade, or hardware media keys) — they reflect the metadata and actions set via the Media
        Session API.
      </p>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {url ? (
        // biome-ignore lint/a11y/useMediaCaption: locally generated tone has no speech content to caption
        <audio
          ref={audioRef}
          controls
          src={url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        !error && <div role="status">Generating tone…</div>
      )}

      {isPlaying && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          Playing — check your OS media controls.
        </div>
      )}
    </div>
  );
}
