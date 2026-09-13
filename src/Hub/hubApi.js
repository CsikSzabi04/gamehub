import { API_BASE, useApi } from '../Components/apiCache.js';

/** Backend routes from gamehub_backend-main/hubRoutes.js */
export const HUB_BASE = `${API_BASE}/hub`;

export const hubUrl = path => `${HUB_BASE}${path}`;

/** useApi for a hub path ("/steam/featured"). Pass null to skip. transform must be module-level. */
export function useHub(path, transform) {
    return useApi(path ? hubUrl(path) : null, transform);
}

const toProviders = data => data?.providers || {};

/** Which keyed providers (igdb, twitch, itad, ...) the backend has API keys for. */
export function useHubProviders() {
    const { data } = useHub('/status', toProviders);
    return data;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export function formatCount(n) {
    return n || n === 0 ? compact.format(n) : '–';
}

export function timeAgo(value) {
    if (!value) return '';
    const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const units = [[86400, 'd'], [3600, 'h'], [60, 'm']];
    for (const [size, label] of units) {
        if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
    }
    return '';
}

// Shared transforms (module-level so useApi can memoize them)
export const pickItems = data => (Array.isArray(data?.items) ? data.items : []);
export const pickTopSellers = data => data?.topSellers || [];
export const pickNewReleases = data => data?.newReleases || [];
export const pickSpecials = data => data?.specials || [];
export const pickComingSoon = data => data?.comingSoon || [];
export const pickGogTrending = data => data?.trending || [];
export const pickGogNewest = data => data?.newest || [];
export const pickGogDeals = data => data?.deals || [];
