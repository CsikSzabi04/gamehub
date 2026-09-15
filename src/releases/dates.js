// Date helpers for the release calendar, reminders and free-game countdowns.
// Day keys are local "YYYY-MM-DD" strings (no time zone surprises when comparing).

const pad = n => String(n).padStart(2, '0');

export const dayKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const monthKeyOf = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

/** "YYYY-MM-DD" -> local Date at noon (safe against DST edges). */
export function dateFromKey(key) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12) : null;
}

/** "YYYY-MM" +/- n months. */
export function shiftMonth(month, n) {
    const [y, m] = month.split('-').map(Number);
    return monthKeyOf(new Date(y, m - 1 + n, 1));
}

export const isMonthKey = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''));

/** Whole days from today to a day key (negative = past). */
export function daysUntil(key) {
    const target = dateFromKey(key);
    if (!target) return null;
    const today = dateFromKey(dayKey());
    return Math.round((target - today) / 86400000);
}

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/**
 * Parses store release strings: "2026-10-14", ISO timestamps, "Oct 14, 2026", "14 Oct, 2026",
 * "October 2026", "Q3 2026", "2026", "Coming soon", "To be announced", "TBA".
 * @returns {{ date: string|null, precision: 'day'|'month'|'quarter'|'year'|'unknown', future: boolean, tba: boolean }}
 */
export function parseReleaseDate(value, comingSoon = false) {
    const text = String(value || '').trim();
    const today = dayKey();
    const result = (date, precision, lastDay) => ({
        date: precision === 'day' ? date : null,
        precision,
        future: lastDay ? lastDay > today : Boolean(comingSoon),
        tba: precision !== 'day',
    });

    if (!text || /coming soon|tba|to be announced|announced|tbd|soon/i.test(text)) return result(null, 'unknown', null);

    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    if (m) return result(`${m[1]}-${m[2]}-${m[3]}`, 'day', `${m[1]}-${m[2]}-${m[3]}`);

    const monthIndex = word => MONTHS[String(word).slice(0, 3).toLowerCase()];
    const endOfMonth = (y, mi) => dayKey(new Date(y, mi + 1, 0));

    // "Oct 14, 2026" / "October 14 2026"
    m = /^([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i.exec(text);
    if (m && monthIndex(m[1]) != null) {
        const key = dayKey(new Date(Number(m[3]), monthIndex(m[1]), Number(m[2]), 12));
        return result(key, 'day', key);
    }
    // "14 Oct, 2026"
    m = /^(\d{1,2})\.?\s+([a-z]{3,})\.?,?\s+(\d{4})$/i.exec(text);
    if (m && monthIndex(m[2]) != null) {
        const key = dayKey(new Date(Number(m[3]), monthIndex(m[2]), Number(m[1]), 12));
        return result(key, 'day', key);
    }
    // "October 2026" / "Oct 2026"
    m = /^([a-z]{3,})\.?,?\s+(\d{4})$/i.exec(text);
    if (m && monthIndex(m[1]) != null) return result(null, 'month', endOfMonth(Number(m[2]), monthIndex(m[1])));
    // "Q3 2026"
    m = /^q([1-4])\s*(\d{4})$/i.exec(text);
    if (m) return result(null, 'quarter', endOfMonth(Number(m[2]), Number(m[1]) * 3 - 1));
    // "2026"
    m = /^(\d{4})$/.exec(text);
    if (m) return result(null, 'year', `${m[1]}-12-31`);

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        const key = dayKey(parsed);
        return result(key, 'day', key);
    }
    return result(null, 'unknown', null);
}
