import { useEffect, useRef, useState } from 'react';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function toICSDate(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function makeUid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CalendarEventsDemo() {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState('WebCanDoIt demo event');
  const [start, setStart] = useState(toLocalInputValue(now));
  const [end, setEnd] = useState(toLocalInputValue(later));
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const generate = () => {
    setError(null);

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError('Please provide valid start and end times.');
      return;
    }
    if (endDate <= startDate) {
      setError('End time must be after start time.');
      return;
    }

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WebCanDoIt//Calendar Events Demo//EN',
      'BEGIN:VEVENT',
      `UID:${makeUid()}`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(endDate)}`,
      `SUMMARY:${escapeICSText(title || 'Untitled event')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const newUrl = URL.createObjectURL(blob);

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }
    urlRef.current = newUrl;
    setDownloadUrl(newUrl);
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        No calendar API is used here — this builds a standard <code>.ics</code> file as a{' '}
        <code>Blob</code> and offers it as a download, which any calendar app can import.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px' }}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Start
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          End
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
      </div>
      <p>
        <button type="button" onClick={generate}>
          Generate .ics file
        </button>
      </p>
      {downloadUrl && (
        <p role="status">
          <a href={downloadUrl} download="event.ics">
            Download event.ics
          </a>
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
