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

const compactFormats = {};

/** Compact count ("1.2K"). Pass the UI locale (useT().locale); defaults to en-US. */
export function formatCount(n, locale = 'en-US') {
    if (!(n || n === 0)) return '–';
    if (!compactFormats[locale]) compactFormats[locale] = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return compactFormats[locale].format(n);
}

const relativeFormats = {};

/**
 * Relative time ("3h ago"). Pass the UI locale (useT().locale); English keeps the short
 * "3h ago" style, other languages use Intl.RelativeTimeFormat.
 */
export function timeAgo(value, locale = 'en-US') {
    if (!value) return '';
    const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
    const english = String(locale).toLowerCase().startsWith('en');
    if (!english && !relativeFormats[locale]) {
        relativeFormats[locale] = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: String(locale).startsWith('hu') ? 'narrow' : 'short' });
    }
    if (seconds < 60) return english ? 'just now' : relativeFormats[locale].format(0, 'second');
    const units = [[86400, 'd', 'day'], [3600, 'h', 'hour'], [60, 'm', 'minute']];
    for (const [size, label, unit] of units) {
        if (seconds >= size) {
            const amount = Math.floor(seconds / size);
            return english ? `${amount}${label} ago` : relativeFormats[locale].format(-amount, unit);
        }
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
