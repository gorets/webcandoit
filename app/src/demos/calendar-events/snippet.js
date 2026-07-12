function toICSDate(date) {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function escapeICSText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

const generateButton = document.querySelector('#generate-ics-button');
const downloadLink = document.querySelector('#ics-download-link');
const titleInput = document.querySelector('#event-title');
const startInput = document.querySelector('#event-start');
const endInput = document.querySelector('#event-end');

generateButton.addEventListener('click', () => {
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    console.error('Please provide a valid start/end range.');
    return;
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WebCanDoIt//Calendar Events Demo//EN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(startDate)}`,
    `DTEND:${toICSDate(endDate)}`,
    `SUMMARY:${escapeICSText(titleInput.value || 'Untitled event')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'event.ics';
});
