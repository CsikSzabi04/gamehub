// "Play" for games the user owns on Steam: steam://rungameid/<appid> starts the installed game
// (or opens Steam's install dialog). Console libraries (Xbox, PSN) have no browser launch link.
import { firestore } from '../lib/firebase.js';
import { normalizeTitle, titleMatch } from '../gamepage/matching.js';

const OWNED_TTL = 60 * 1000;

export const steamRunUrl = appid => `steam://rungameid/${appid}`;

/** Steam only runs on desktops (Windows, macOS, Linux, SteamOS). */
export function canLaunchSteam() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return false;
    return !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
}

/** Steam appid a library item can be launched with, or null (not Steam / only wishlisted). */
export function launchableAppId(item) {
    if (!item || item.source !== 'steam' || item.status === 'wishlist') return null;
    const id = Number(item.sourceId || String(item.gameKey || '').replace(/^steam-/, ''));
    return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * The owned Steam game for a page: the exact appid first, then the title
 * (RAWG's "Grand Theft Auto V" is "Grand Theft Auto V Legacy" in a Steam library).
 */
export function findOwnedSteamGame(items, { steamAppId, name } = {}) {
    const owned = (items || []).filter(launchableAppId);
    if (steamAppId) {
        const exact = owned.find(item => launchableAppId(item) === Number(steamAppId));
        if (exact) return exact;
    }
    if (!normalizeTitle(name)) return null;
    return owned.find(item => titleMatch(item.name, name) === 'exact')
        || owned.find(item => titleMatch(item.name, name) === 'close')
        || null;
}

// uid -> { at, promise } : one library read per minute, shared by every Play button on the page
const ownedCache = new Map();

export function loadOwnedSteamGames(uid) {
    if (!uid) return Promise.resolve([]);
    const cached = ownedCache.get(uid);
    if (cached && Date.now() - cached.at < OWNED_TTL) return cached.promise;
    const promise = firestore()
        .then(({ db, collection, getDocs, query, where }) => getDocs(query(collection(db, 'users', uid, 'library'), where('source', '==', 'steam'))))
        .then(snap => snap.docs.map(d => ({ ...d.data(), gameKey: d.id })))
        .catch(error => {
            ownedCache.delete(uid);
            console.error('Could not load owned Steam games:', error);
            return [];
        });
    ownedCache.set(uid, { at: Date.now(), promise });
    return promise;
}

const listeners = new Set();

/** fn() runs after library writes; returns an unsubscribe function. */
export function onOwnedSteamGamesChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Call after library writes so Play buttons pick up the change. */
export function invalidateOwnedSteamGames(uid) {
    if (uid) ownedCache.delete(uid);
    else ownedCache.clear();
    listeners.forEach(fn => fn());
}
