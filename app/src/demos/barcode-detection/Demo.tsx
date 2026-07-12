import { useEffect, useRef, useState } from 'react';

interface DetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
}

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

export default function BarcodeDetectionDemo() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [results, setResults] = useState<DetectedBarcode[] | null>(null);
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
    setResults(null);
    setBusy(true);
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetector();
      const detected = await detector.detect(bitmap);
      bitmap.close();
      setResults(
        detected.map((d) => ({
          rawValue: d.rawValue,
          format: d.format,
          boundingBox: d.boundingBox,
        })),
      );
    } catch {
      setError('Could not detect barcodes in this image. Try a different image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>Choose an image containing a barcode or QR code</span>
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
        <img
          src={imageUrl}
          alt="Selected for barcode detection"
          style={{ maxWidth: '100%', maxHeight: '360px', borderRadius: 'var(--radius)' }}
        />
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
      {results && (
        <div role="status">
          {results.length === 0 ? (
            <p style={{ color: 'var(--text-dim)' }}>No barcodes found in this image.</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={`${r.format}-${r.rawValue}-${r.boundingBox.x}-${r.boundingBox.y}`}>
                  <strong>{r.format}</strong>: {r.rawValue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
