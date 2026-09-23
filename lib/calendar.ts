import type { Event } from '../types';

/**
 * Formats a Date object to the standard iCalendar UTC string format:
 * YYYYMMDDTHHmmssZ (e.g., 20261106T090000Z)
 */
export function formatIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes characters for iCalendar text fields per RFC 5545:
 * Backslashes, semicolons, commas, and line breaks.
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

/**
 * Folds lines longer than 75 octets per RFC 5545 section 3.1.
 */
function foldLine(line: string): string {
  const MAX_LEN = 74;
  if (line.length <= MAX_LEN) return line;

  const chunks: string[] = [];
  chunks.push(line.slice(0, MAX_LEN));
  let remaining = line.slice(MAX_LEN);

  while (remaining.length > 0) {
    // Folded lines start with a single whitespace character (space or tab)
    chunks.push(' ' + remaining.slice(0, MAX_LEN - 1));
    remaining = remaining.slice(MAX_LEN - 1);
  }

  return chunks.join('\r\n');
}

/**
 * Calculates start and end dates for an event, defaulting end date if missing.
 */
export function getEventDateTimes(event: Event): { startDate: Date; endDate: Date } {
  const startDate = new Date(event.startDate);
  let endDate: Date;

  if (event.endDate) {
    endDate = new Date(event.endDate);
  } else {
    // Default duration: 3 hours for conferences/workshops, 2 hours for meetups
    const durationHours = event.category === 'Conference' ? 8 : 3;
    endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  }

  // Fallback if dates are invalid
  if (isNaN(startDate.getTime())) {
    const fallback = new Date('2026-10-01T09:00:00Z');
    return {
      startDate: fallback,
      endDate: new Date(fallback.getTime() + 4 * 60 * 60 * 1000),
    };
  }

  if (isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) {
    endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}

/**
 * Generates an RFC 5545 compliant VEVENT component string.
 */
export function generateEventVEvent(event: Event): string {
  const { startDate, endDate } = getEventDateTimes(event);
  const now = new Date();
  const uid = `${event.slug || event.id || 'event'}-${startDate.getTime()}@loops.ng`;

  const location = event.venue
    ? `${event.venue}, ${event.city}, Nigeria`
    : `${event.city}, Nigeria`;

  const descriptionParts = [
    event.description || '',
    '',
    `Category: ${event.category || 'Convening'}`,
    `Format: ${event.format || 'In-Person'}`,
    `Organiser: ${event.organiser || 'AI Loops Registry'}`,
    event.price ? `Admission: ${event.price}` : `Admission: ${event.priceType || 'Free'}`,
    event.registrationUrl ? `Registration & Info: ${event.registrationUrl}` : '',
    '',
    'Indexed by AI Loops — Nigeria AI & Tech Convening Registry',
  ].filter(Boolean);

  const fullDescription = descriptionParts.join('\n');

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(fullDescription)}`,
    `LOCATION:${escapeIcsText(location)}`,
    event.registrationUrl ? `URL:${escapeIcsText(event.registrationUrl)}` : `URL:https://loops.ng`,
    `ORGANIZER;CN=${escapeIcsText(event.organiser || 'AI Loops')}:mailto:registry@loops.ng`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
    'END:VEVENT',
  ];

  return lines.map(foldLine).join('\r\n');
}

/**
 * Generates a complete iCalendar (.ics) string for one or multiple events.
 */
export function generateIcsCalendar(
  events: Event | Event[],
  calendarName = 'AI Loops Nigeria Calendar'
): string {
  const eventList = Array.isArray(events) ? events : [events];

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Loops Nigeria//National Convening Registry//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Africa/Lagos',
  ].map(foldLine);

  const vevents = eventList.map(generateEventVEvent);

  const footer = ['END:VCALENDAR'];

  return [...header, ...vevents, ...footer].join('\r\n');
}

/**
 * Triggers a browser download of an iCalendar (.ics) file.
 * Compatible with Apple Calendar (macOS, iOS), Outlook, and all standard desktop calendar clients.
 */
export function downloadIcsFile(events: Event | Event[], customFilename?: string): void {
  const icsData = generateIcsCalendar(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  let filename = customFilename;
  if (!filename) {
    if (!Array.isArray(events)) {
      filename = `${events.slug || 'event'}.ics`;
    } else if (events.length === 1) {
      filename = `${events[0].slug || 'event'}.ics`;
    } else {
      filename = `ai-loops-nigeria-events-${formatIcsDate(new Date()).slice(0, 8)}.ics`;
    }
  }

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL after a short timeout
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Generates a direct "Add to Google Calendar" web link.
 * Pre-populates title, start/end dates, location, description, and link.
 */
export function generateGoogleCalendarUrl(event: Event): string {
  const { startDate, endDate } = getEventDateTimes(event);

  const startFormatted = formatIcsDate(startDate);
  const endFormatted = formatIcsDate(endDate);

  const location = event.venue
    ? `${event.venue}, ${event.city}, Nigeria`
    : `${event.city}, Nigeria`;

  const detailsParts = [
    event.description || '',
    '',
    `Organiser: ${event.organiser || 'AI Loops Registry'}`,
    `Format: ${event.format || 'In-Person'} · ${event.category || 'Convening'}`,
    event.price ? `Admission: ${event.price}` : `Admission: ${event.priceType || 'Free'}`,
    event.registrationUrl ? `Registration Link: ${event.registrationUrl}` : '',
    '',
    'AI Loops National Registry: https://loops.ng',
  ].filter(Boolean);

  const details = detailsParts.join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startFormatted}/${endFormatted}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a direct "Add to Outlook Live / 365" web link.
 */
export function generateOutlookCalendarUrl(event: Event): string {
  const { startDate, endDate } = getEventDateTimes(event);

  const location = event.venue
    ? `${event.venue}, ${event.city}, Nigeria`
    : `${event.city}, Nigeria`;

  const detailsParts = [
    event.description || '',
    `Organiser: ${event.organiser || 'AI Loops'}`,
    event.registrationUrl ? `Registration: ${event.registrationUrl}` : '',
  ].filter(Boolean);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: detailsParts.join('\n\n'),
    location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
