import { useEffect, useMemo, useState } from 'react';

/**
 * Persistent stale-while-revalidate cache for API responses.
 *
 * - Answers are kept in memory and in localStorage, so a returning visitor
 *   sees data on the very first render (no spinner, no network wait).
 * - Cached data older than `maxAge` is still returned immediately and
 *   refreshed in the background; subscribers (useApi) re-render on update.
 * - On a first visit, backend endpoints that have a build-time snapshot
 *   (public/api-snapshot, served by the static host's CDN) race the live API,
 *   so a sleeping Render instance can't block the page.
 */

export const API_BASE = 'https://gamehub-backend-zekj.onrender.com';

const STORAGE_PREFIX = 'gdh-api:v1:';
const DEFAULT_MAX_AGE = 5 * 60 * 1000;
const REQUEST_TIMEOUT = 20000;

// Endpoints written to public/api-snapshot/<name>.json by scripts/snapshot.mjs
export const SNAPSHOT_PATHS = ['fetch-games', 'stores', 'free', 'discounted', 'loot', 'news', 'getgamingnews', 'movies', 'characters', 'charactersK', 'hub/steam/featured', 'hub/steam/most-played', 'hub/universes'];

const memory = new Map(); // url -> { data, ts }
const inFlight = new Map(); // url -> Promise
const listeners = new Map(); // url -> Set<fn>

function readStorage(url) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + url);
        return raw ? JSON.parse(raw) : undefined;
    } catch {
        return undefined;
    }
}

function writeStorage(url, entry) {
    try {
        localStorage.setItem(STORAGE_PREFIX + url, JSON.stringify(entry));
    } catch {
        // Quota exceeded or storage disabled: drop our older entries and carry on
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith('gdh-api:') && k !== STORAGE_PREFIX + url)
                .forEach(k => localStorage.removeItem(k));
        } catch { /* ignore */ }
    }
}

function getEntry(url) {
    let entry = memory.get(url);
    if (!entry) {
        entry = readStorage(url);
        if (entry) memory.set(url, entry);
    }
    return entry;
}

function store(url, data) {
    const entry = { data, ts: Date.now() };
    memory.set(url, entry);
    writeStorage(url, entry);
    listeners.get(url)?.forEach(fn => fn(data));
    return data;
}

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

function snapshotUrl(url) {
    if (!url.startsWith(API_BASE + '/')) return null;
    const path = url.slice(API_BASE.length + 1);
    return SNAPSHOT_PATHS.includes(path) ? `/api-snapshot/${path}.json` : null;
}

// index.html starts some requests before the JS bundle has loaded; reuse them once
function takePrefetched(url) {
    const early = typeof window !== 'undefined' ? window.__gdhPrefetch?.[url] : undefined;
    if (!early) return fetchJson(url);
    delete window.__gdhPrefetch[url];
    return early.then(r => (r && r.ok ? r.json() : fetchJson(url)), () => fetchJson(url));
}

function revalidate(url) {
    if (inFlight.has(url)) return inFlight.get(url);
    const promise = takePrefetched(url)
        .then(data => store(url, data))
        .finally(() => inFlight.delete(url));
    inFlight.set(url, promise);
    return promise;
}

/** Synchronously returns cached data for url (memory or localStorage), or undefined. */
export function peekCached(url) {
    return getEntry(url)?.data;
}

/**
 * Fetches a URL, answering from cache whenever possible.
 * @param {string} url
 * @param {{ maxAge?: number }} [options]
 * @returns {Promise<any>}
 */
export function cachedFetch(url, { maxAge = DEFAULT_MAX_AGE } = {}) {
    const entry = getEntry(url);
    if (entry) {
        if (Date.now() - entry.ts > maxAge) revalidate(url).catch(() => {});
        return Promise.resolve(entry.data);
    }

    const live = revalidate(url);
    const snap = snapshotUrl(url);
    if (!snap) return live;

    // First visit: whichever answers first wins; the live answer still updates the cache.
    const fromSnapshot = takePrefetched(snap).then(data => {
        if (!memory.has(url)) memory.set(url, { data, ts: 0 });
        return data;
    });
    live.catch(() => {});
    return Promise.any([live, fromSnapshot]).catch(() => live);
}

/** Subscribes to background updates of url. Returns an unsubscribe function. */
export function subscribe(url, fn) {
    if (!listeners.has(url)) listeners.set(url, new Set());
    listeners.get(url).add(fn);
    return () => listeners.get(url)?.delete(fn);
}

/**
 * React hook: returns { data, loading, error } for url.
 * Renders cached data immediately and updates when fresher data arrives.
 * @param {string|null} url - pass null to skip
 * @param {(raw: any) => any} [transform] - should be a stable (module-level) function
 */
export function useApi(url, transform) {
    const [raw, setRaw] = useState(() => (url ? peekCached(url) : undefined));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;
        let active = true;
        const unsubscribe = subscribe(url, data => active && setRaw(data));
        cachedFetch(url)
            .then(data => active && setRaw(data))
            .catch(err => {
                console.error('API error:', url, err);
                if (active) setError(err);
            });
        return () => {
            active = false;
            unsubscribe();
        };
    }, [url]);

    const data = useMemo(() => {
        if (raw === undefined) return undefined;
        if (!transform) return raw;
        try {
            return transform(raw);
        } catch (err) {
            console.error('API transform error:', url, err);
            return undefined;
        }
    }, [raw, transform, url]);

    return { data, loading: data === undefined && !error, error };
}
