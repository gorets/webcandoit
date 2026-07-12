import { useEffect, useRef, useState } from 'react';

interface DetectedFaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedFace {
  boundingBox: DetectedFaceBox;
}

declare class FaceDetector {
  constructor(options?: { maxDetectedFaces?: number; fastMode?: boolean });
  detect(image: ImageBitmapSource): Promise<DetectedFace[]>;
}

export default function FaceDetectionDemo() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [faces, setFaces] = useState<DetectedFace[] | null>(null);
  const [bitmapSize, setBitmapSize] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    imageUrlRef.current = imageUrl;
  }, [imageUrl]);

  useEffect(
    () => () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    },
    [],
  );

  const handleFile = async (file: File) => {
    setError(null);
    setFaces(null);
    setBitmapSize(null);
    setBusy(true);
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    try {
      const bitmap = await createImageBitmap(file);
      setBitmapSize({ width: bitmap.width, height: bitmap.height });
      const detector = new FaceDetector({ fastMode: true });
      const detected = await detector.detect(bitmap);
      bitmap.close();
      setFaces(detected);
    } catch {
      setError('Could not detect faces in this image. Try a different image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>Choose an image containing one or more faces</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFile(file);
            }
          }}
        />
      </label>
      {imageUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={imageUrl}
            alt="Selected for face detection"
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '360px',
              borderRadius: 'var(--radius)',
            }}
          />
          {bitmapSize &&
            faces?.map((face) => (
              <div
                key={`${face.boundingBox.x}-${face.boundingBox.y}-${face.boundingBox.width}-${face.boundingBox.height}`}
                style={{
                  position: 'absolute',
                  left: `${(face.boundingBox.x / bitmapSize.width) * 100}%`,
                  top: `${(face.boundingBox.y / bitmapSize.height) * 100}%`,
                  width: `${(face.boundingBox.width / bitmapSize.width) * 100}%`,
                  height: `${(face.boundingBox.height / bitmapSize.height) * 100}%`,
                  border: '2px solid var(--accent)',
                  boxSizing: 'border-box',
                }}
              />
            ))}
        </div>
      )}
      {busy && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          Detecting…
        </div>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {faces && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {faces.length === 0 ? 'No faces found in this image.' : `Found ${faces.length} face(s).`}
        </div>
      )}
    </div>
  );
}
