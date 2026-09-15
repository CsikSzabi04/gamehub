// Finds the Steam version of a game known from RAWG / GOG, so every game page gets
// Steam requirements ("Can I run it?"), facts ("What to expect") and live stats.
//
// 1. RAWG's store links name the exact Steam appid (reliable even when titles differ:
//    "Grand Theft Auto V" -> "Grand Theft Auto V Enhanced").
// 2. Without a RAWG Steam link, the backend's Steam search by title (checked for title and release year).
import { useApi } from '../Components/apiCache.js';
import { useHub } from '../Hub/hubApi.js';
import { sameRelease, titleMatch } from './matching.js';

const RAWG_KEY = '984255fceb114b05b5e746dc24a8520a';

const rawgStoresUrl = id => `https://api.rawg.io/api/games/${encodeURIComponent(id)}/stores?key=${RAWG_KEY}`;

export function steamAppIdFromStores(data) {
    const results = Array.isArray(data?.results) ? data.results : [];
    for (const entry of results) {
        const match = /store\.steampowered\.com\/app\/(\d{1,12})/i.exec(entry?.url || '');
        if (match) return Number(match[1]);
    }
    return null;
}

const toFound = data => (data?.found ? data : null);
const toApp = data => (data && !data.error && data.name ? data : null);

/**
 * @param {object} options
 * @param {number|string|null|undefined} options.rawgId RAWG game id; null = no RAWG match, undefined = still searching
 * @param {string} [options.name] title for the Steam search fallback
 * @param {string} [options.releaseDate] to reject same-named games from other years
 * @param {boolean} [options.enabled] false skips every request
 * @returns {{ steamAppId: number|null, steam: object|null, settled: boolean }}
 */
export default function useSteamMatch({ rawgId, name, releaseDate, enabled = true }) {
    const { data: storeAppId, error: storesError } = useApi(enabled && rawgId ? rawgStoresUrl(rawgId) : null, steamAppIdFromStores);
    const storesDone = rawgId === null || storeAppId !== undefined || Boolean(storesError);

    const lookupWanted = enabled && storesDone && !storeAppId && Boolean(name);
    const { data: found, error: lookupError } = useHub(lookupWanted ? `/steam/lookup?name=${encodeURIComponent(name)}` : null, toFound);
    const lookup = lookupWanted && found && titleMatch(found.name, name) && sameRelease(found.releaseDate, releaseDate) ? found : null;

    const { data: app, error: appError } = useHub(enabled && storeAppId ? `/steam/app/${storeAppId}` : null, toApp);

    if (!enabled) return { steamAppId: null, steam: null, settled: true };
    if (storeAppId) return { steamAppId: storeAppId, steam: app || null, settled: app !== undefined || Boolean(appError) };
    return {
        steamAppId: lookup?.id ?? null,
        steam: lookup,
        settled: storesDone && (!lookupWanted || found !== undefined || Boolean(lookupError)),
    };
}
