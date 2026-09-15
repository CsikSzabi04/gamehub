// Game identity shared by library, alerts, reminders, reviews and activity.
//
// gameKey: "steam-730" | "gog-1207658924" | "rawg-3498" (plain numbers are treated as RAWG ids, like old reviews)

export function gameKey(source, id) {
    return `${source}-${id}`;
}

export function parseGameKey(key) {
    const text = String(key || '');
    const match = /^(steam|gog|rawg)-(\d+)$/.exec(text);
    if (match) return { source: match[1], id: match[2] };
    // Imported console titles (no in-site game page): xbox-<titleId>, psn-<titleId>
    const consoleMatch = /^(xbox|psn)-([A-Za-z0-9_]+)$/.exec(text);
    if (consoleMatch) return { source: consoleMatch[1], id: consoleMatch[2] };
    if (/^\d+$/.test(text)) return { source: 'rawg', id: text };
    return null;
}

/** In-app link for a game key. */
export function gameHref(key) {
    const parsed = parseGameKey(key);
    if (!parsed) return '/';
    if (parsed.source === 'rawg') return `/searchreview/${parsed.id}`;
    if (parsed.source === 'xbox' || parsed.source === 'psn') return '/library';
    return `/game/${parsed.source}/${parsed.id}`;
}

export const steamHeader = appid => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

/** Lowercase letters and digits only: for matching titles across stores. */
export const normalizeTitle = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
