// iCalendar (.ics) export of release dates (all-day events).
import { dateFromKey } from './dates.js';

const SITE = 'https://gamedatahub.netlify.app';

const escapeText = value => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const compactDay = key => key.replace(/-/g, '');

function nextDay(key) {
    const date = dateFromKey(key);
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

/** Lines longer than 75 octets must be folded (RFC 5545). */
function fold(line) {
    const parts = [];
    let rest = line;
    while (rest.length > 74) {
        parts.push(rest.slice(0, 74));
        rest = ` ${rest.slice(74)}`;
    }
    parts.push(rest);
    return parts.join('\r\n');
}

/**
 * @param {{ gameKey: string, name: string, releaseDate: string, url?: string, description?: string }[]} events
 */
export function buildIcs(events) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GameDataHub//Release calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (const e of events) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(e.releaseDate || '')) continue;
        const url = e.url ? (e.url.startsWith('http') ? e.url : `${SITE}${e.url}`) : SITE;
        lines.push(
            'BEGIN:VEVENT',
            `UID:${escapeText(e.gameKey)}-${compactDay(e.releaseDate)}@gamedatahub`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${compactDay(e.releaseDate)}`,
            `DTEND;VALUE=DATE:${nextDay(e.releaseDate)}`,
            `SUMMARY:${escapeText(e.name)}`,
            `DESCRIPTION:${escapeText(e.description || url)}`,
            `URL:${url}`,
            'TRANSP:TRANSPARENT',
            'END:VEVENT',
        );
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
}

/** Starts a download of the .ics file (returns the number of exported events). */
export function downloadIcs(filename, events) {
    const valid = events.filter(e => /^\d{4}-\d{2}-\d{2}$/.test(e.releaseDate || ''));
    if (!valid.length) return 0;
    const blob = new Blob([buildIcs(valid)], { type: 'text/calendar;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `${String(filename || 'releases').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'releases'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 5000);
    return valid.length;
}
