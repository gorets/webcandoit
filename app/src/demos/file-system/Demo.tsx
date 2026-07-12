import { useRef, useState } from 'react';

interface FileSystemWritableFileStreamLike {
  write: (data: string) => Promise<void>;
  close: () => Promise<void>;
}

interface FileSystemFileHandleLike {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStreamLike>;
}

interface FileSystemAccessWindow {
  showOpenFilePicker: (options?: {
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandleLike[]>;
  showSaveFilePicker: (options?: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandleLike>;
}

const TEXT_FILE_TYPES = [{ description: 'Text files', accept: { 'text/plain': ['.txt'] } }];

export default function FileSystemDemo() {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileHandleRef = useRef<FileSystemFileHandleLike | null>(null);

  const getApi = () => window as unknown as FileSystemAccessWindow;

  const handleOpen = async () => {
    setError(null);
    try {
      const [handle] = await getApi().showOpenFilePicker({ types: TEXT_FILE_TYPES });
      const file = await handle.getFile();
      const text = await file.text();
      fileHandleRef.current = handle;
      setFileName(handle.name);
      setContent(text);
      setStatus(`Opened "${handle.name}" (${file.size} bytes).`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('File selection cancelled.');
        return;
      }
      setError('Could not open the file. Please try again.');
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      let handle = fileHandleRef.current;
      if (!handle) {
        handle = await getApi().showSaveFilePicker({
          suggestedName: fileName ?? 'untitled.txt',
          types: TEXT_FILE_TYPES,
        });
        fileHandleRef.current = handle;
        setFileName(handle.name);
      }
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      setStatus(`Saved "${handle.name}".`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('Save cancelled.');
        return;
      }
      setError('Could not save the file. Please try again.');
    }
  };

  const handleSaveAs = async () => {
    fileHandleRef.current = null;
    await handleSave();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleOpen}>
          Open file…
        </button>
        <button type="button" onClick={handleSave}>
          Save
        </button>
        <button type="button" onClick={handleSaveAs}>
          Save as…
        </button>
      </div>
      <label htmlFor="fs-editor" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        {fileName ? `Editing "${fileName}"` : 'No file open — type below or open one'}
      </label>
      <textarea
        id="fs-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          fontFamily: 'monospace',
          resize: 'vertical',
        }}
      />
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status && !error && <div role="status">{status}</div>}
    </div>
  );
}
