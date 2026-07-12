import { useEffect, useRef, useState } from 'react';

export default function AudioRecordingDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Allow microphone access and try again.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No microphone was found on this device.');
      } else {
        setError('Could not start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={startRecording} disabled={isRecording}>
          Record
        </button>
        <button type="button" onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
      </div>

      {isRecording && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          Recording…
        </div>
      )}

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-dim)' }}>Playback:</div>
          {/* biome-ignore lint/a11y/useMediaCaption: user-recorded audio has no caption track */}
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
}
