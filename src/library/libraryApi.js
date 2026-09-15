// Game library / backlog tracker: Firestore helpers (no React).
//
// users/{uid}/library/{gameKey} = {
//   gameKey, name, image, source, sourceId, platform,
//   status: 'playing' | 'completed' | 'backlog' | 'dropped' | 'wishlist',
//   playtimeHours (number|null, user entered), steamPlaytimeHours (number|null, from Steam import),
//   lastPlayed (ISO string|null, from Steam import), rating (1-5|null), note (<= 280 chars),
//   startedAt, completedAt, createdAt, updatedAt, playingPosted (bool: "playing" activity already posted)
// }
// users/{uid}.libraryStats = { total, completed, playing, backlog, dropped, wishlist, updatedAt }
// users/{uid}.steamId = '7656119...'
import { firestore, toDate } from '../lib/firebase.js';
import { apiGet } from '../lib/api.js';
import { gameHref, parseGameKey, steamHeader } from '../lib/games.js';
import { postActivity } from '../social/activity.js';
import { invalidateOwnedSteamGames } from './steamLaunch.js';

export const LIBRARY_STATUSES = ['playing', 'completed', 'backlog', 'dropped', 'wishlist'];

export const STATUS_COLORS = {
    playing: '#60a5fa',
    completed: '#34d399',
    backlog: '#fbbf24',
    dropped: '#f87171',
    wishlist: '#c4b5fd',
};

export const NOTE_MAX = 280;
const BATCH_SIZE = 400;
const KEY_RE = /^[a-z0-9_-]{1,80}$/i;

export const isValidKey = key => typeof key === 'string' && KEY_RE.test(key);

/** Hours shown for an item: the user's own number wins over the Steam playtime. */
export function itemHours(item) {
    const own = item?.playtimeHours;
    if (typeof own === 'number' && Number.isFinite(own)) return own;
    const steam = item?.steamPlaytimeHours;
    return typeof steam === 'number' && Number.isFinite(steam) ? steam : 0;
}

const cleanText = (value, max) => String(value ?? '').trim().slice(0, max);
const cleanImage = url => (typeof url === 'string' && url.startsWith('https://') && url.length <= 500 ? url : null);

/** Game page `game` / any { gameKey|source+id, name, image } -> fields stored on the library doc. */
export function libraryMeta(game) {
    const key = game?.gameKey || (game?.source && game?.id != null ? `${game.source}-${game.id}` : '');
    const parsed = parseGameKey(key);
    const source = game?.source || parsed?.source || null;
    return {
        gameKey: key,
        name: cleanText(game?.name, 160) || key,
        image: cleanImage(game?.image) || (source === 'steam' && parsed ? steamHeader(parsed.id) : null),
        source,
        sourceId: String(game?.sourceId ?? game?.id ?? parsed?.id ?? ''),
        platform: game?.platform ? cleanText(game.platform, 40) : (source === 'steam' || source === 'gog' ? 'pc' : null),
    };
}

export async function getLibraryItem(uid, key) {
    if (!uid || !isValidKey(key)) return null;
    const { db, doc, getDoc } = await firestore();
    const snap = await getDoc(doc(db, 'users', uid, 'library', key));
    return snap.exists() ? { ...snap.data(), gameKey: key } : null;
}

/**
 * Adds the game / changes its status. `existing` = the current doc (or null) when the caller
 * already knows it; when undefined it is read first. Posts "playing" (once per game) and
 * "completed" (on the transition) to the activity feed.
 */
export async function setLibraryStatus(user, profile, gameMeta, status, existing) {
    if (!user?.uid) throw new Error('Not signed in');
    if (!LIBRARY_STATUSES.includes(status)) throw new Error('Invalid status');
    const meta = libraryMeta(gameMeta);
    if (!isValidKey(meta.gameKey)) throw new Error('Invalid game');

    const prev = existing === undefined ? await getLibraryItem(user.uid, meta.gameKey) : existing;
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    const now = serverTimestamp();

    const data = { status, updatedAt: now, gameKey: meta.gameKey, source: meta.source, sourceId: meta.sourceId };
    // Keep what's already stored when the caller has less info (e.g. no image)
    if (meta.name && (!prev?.name || meta.name !== meta.gameKey)) data.name = meta.name;
    if (meta.image || !prev) data.image = meta.image || prev?.image || null;
    if (!prev?.platform) data.platform = meta.platform;
    if (!prev) {
        Object.assign(data, {
            createdAt: now, playtimeHours: null, steamPlaytimeHours: null, rating: null, note: '',
            startedAt: null, completedAt: null,
        });
    }
    if (status === 'playing' && !prev?.startedAt) data.startedAt = now;
    if (status === 'completed' && prev?.status !== 'completed') data.completedAt = now;

    const postPlaying = status === 'playing' && !prev?.playingPosted;
    const postCompleted = status === 'completed' && prev?.status !== 'completed';
    if (postPlaying) data.playingPosted = true;

    await setDoc(doc(db, 'users', user.uid, 'library', meta.gameKey), data, { merge: true });
    invalidateOwnedSteamGames(user.uid);

    if (postPlaying || postCompleted) {
        postActivity(user, profile, {
            type: postCompleted ? 'completed' : 'playing',
            gameKey: meta.gameKey,
            gameName: data.name || prev?.name || meta.name,
            url: gameHref(meta.gameKey),
            image: data.image || prev?.image || null,
        });
    }
    return { ...(prev || {}), ...data };
}

/** Whitelisted edits: playtimeHours, rating, note, platform. */
export function cleanPatch(patch = {}) {
    const out = {};
    if ('playtimeHours' in patch) {
        const raw = patch.playtimeHours;
        const hours = raw === '' || raw == null ? null : Number(raw);
        out.playtimeHours = hours == null || !Number.isFinite(hours) || hours < 0 ? null : Math.min(Math.round(hours * 10) / 10, 100000);
    }
    if ('rating' in patch) {
        const rating = Math.round(Number(patch.rating));
        out.rating = rating >= 1 && rating <= 5 ? rating : null;
    }
    if ('note' in patch) out.note = cleanText(patch.note, NOTE_MAX);
    if ('platform' in patch) out.platform = cleanText(patch.platform, 40) || null;
    return out;
}

export async function updateLibraryItem(uid, key, patch) {
    if (!uid || !isValidKey(key)) throw new Error('Invalid game');
    const clean = cleanPatch(patch);
    if (!Object.keys(clean).length) return;
    const { db, doc, updateDoc, serverTimestamp } = await firestore();
    await updateDoc(doc(db, 'users', uid, 'library', key), { ...clean, updatedAt: serverTimestamp() });
}

export async function removeLibraryItem(uid, key) {
    if (!uid || !isValidKey(key)) return;
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'users', uid, 'library', key));
    invalidateOwnedSteamGames(uid);
}

/**
 * Bulk add (Steam import). items: [{ gameKey, name, image, source, sourceId, status, steamPlaytimeHours, lastPlayed, platform }].
 * Keys in `skipKeys` are left untouched. Returns the number of games written.
 */
export async function importLibraryItems(uid, items, skipKeys = new Set()) {
    if (!uid) throw new Error('Not signed in');
    const seen = new Set(skipKeys);
    const clean = [];
    for (const item of items || []) {
        const meta = libraryMeta(item);
        if (!isValidKey(meta.gameKey) || seen.has(meta.gameKey) || !LIBRARY_STATUSES.includes(item.status)) continue;
        seen.add(meta.gameKey);
        const steamHours = Number(item.steamPlaytimeHours);
        clean.push({
            ...meta,
            status: item.status,
            steamPlaytimeHours: Number.isFinite(steamHours) ? Math.round(steamHours * 10) / 10 : null,
            lastPlayed: toDate(item.lastPlayed)?.toISOString() || null,
        });
    }
    if (!clean.length) return 0;

    const { db, doc, writeBatch, serverTimestamp } = await firestore();
    for (let i = 0; i < clean.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const now = serverTimestamp();
        for (const item of clean.slice(i, i + BATCH_SIZE)) {
            batch.set(doc(db, 'users', uid, 'library', item.gameKey), {
                ...item,
                playtimeHours: null, rating: null, note: '',
                startedAt: null, completedAt: null,
                createdAt: now, updatedAt: now,
            });
        }
        await batch.commit();
    }
    invalidateOwnedSteamGames(uid);
    return clean.length;
}

/* ───────── users/{uid}.libraryStats ───────── */

export function computeLibraryStats(items) {
    const stats = { total: 0, playing: 0, completed: 0, backlog: 0, dropped: 0, wishlist: 0 };
    for (const item of items || []) {
        if (!LIBRARY_STATUSES.includes(item.status)) continue;
        stats.total += 1;
        stats[item.status] += 1;
    }
    return stats;
}

export const statsDiffer = (a, b) => ['total', ...LIBRARY_STATUSES].some(k => (a?.[k] || 0) !== (b?.[k] || 0));

/** Writes the summary. Without `items` it counts on the server (count aggregation, single-field filter). */
export async function syncLibraryStats(uid, items) {
    if (!uid) return null;
    const fs = await firestore();
    let stats;
    if (items) {
        stats = computeLibraryStats(items);
    } else {
        stats = { total: 0 };
        const col = fs.collection(fs.db, 'users', uid, 'library');
        await Promise.all(LIBRARY_STATUSES.map(async status => {
            const snap = await fs.getCountFromServer(fs.query(col, fs.where('status', '==', status)));
            stats[status] = snap.data().count;
            stats.total += stats[status];
        }));
    }
    await fs.setDoc(fs.doc(fs.db, 'users', uid), { libraryStats: { ...stats, updatedAt: fs.serverTimestamp() } }, { merge: true });
    return stats;
}

const statTimers = new Map();

/** Debounced syncLibraryStats. getItems() (optional) returns the current items at fire time. */
export function scheduleStatsSync(uid, getItems, onDone, delay = 1500) {
    if (!uid) return;
    clearTimeout(statTimers.get(uid));
    statTimers.set(uid, setTimeout(() => {
        statTimers.delete(uid);
        syncLibraryStats(uid, getItems ? getItems() : undefined)
            .then(stats => stats && onDone?.(stats))
            .catch(error => console.error('Could not sync library stats:', error));
    }, delay));
}

/* ───────── Steam import ───────── */

/** -> { steamId, games: [{ appid, name, playtimeHours, lastPlayed, image }] }; errors carry .status and .data.code */
export function fetchSteamOwned(profile) {
    return apiGet(`/steam/owned?profile=${encodeURIComponent(String(profile || '').trim())}`);
}

export async function saveSteamId(uid, steamId) {
    if (!uid || !/^7656119\d{10}$/.test(String(steamId))) return;
    const { db, doc, setDoc } = await firestore();
    await setDoc(doc(db, 'users', uid), { steamId: String(steamId) }, { merge: true });
}

export function steamImportItem(game, status) {
    return {
        gameKey: `steam-${game.appid}`,
        name: game.name,
        image: game.image || steamHeader(game.appid),
        source: 'steam',
        sourceId: String(game.appid),
        platform: 'pc',
        status,
        steamPlaytimeHours: game.playtimeHours,
        lastPlayed: game.lastPlayed,
    };
}

/* ───────── Stats, suggestions, Wrapped ───────── */

function dateInYear(value, year) {
    const date = toDate(value);
    return date && date.getFullYear() === year ? date : null;
}

export function computeOverview(items, year) {
    let completedThisYear = 0;
    let backlog = 0;
    let wishlist = 0;
    let hours = 0;
    for (const item of items) {
        if (item.status === 'completed' && dateInYear(item.completedAt, year)) completedThisYear += 1;
        if (item.status === 'backlog') backlog += 1;
        if (item.status === 'wishlist') wishlist += 1;
        hours += itemHours(item);
    }
    const owned = items.length - wishlist;
    return {
        total: items.length,
        completedThisYear,
        backlog,
        hours: Math.round(hours),
        shamePct: owned > 0 ? Math.round((backlog / owned) * 100) : 0,
    };
}

/** Weighted random backlog pick: rated games and ones you already tried a little come up more often. */
export function pickNextGame(items, excludeKey = null, random = Math.random) {
    let pool = items.filter(item => item.status === 'backlog');
    if (pool.length > 1 && excludeKey) pool = pool.filter(item => item.gameKey !== excludeKey);
    if (!pool.length) return null;
    const weights = pool.map(item => {
        const hours = itemHours(item);
        let weight = 1;
        if (item.rating) weight += item.rating * 1.5;
        if (hours > 0 && hours < 5) weight += 2; // started, short session so far
        if (hours >= 20) weight *= 0.5; // long sink, probably not "quick next"
        return weight;
    });
    let roll = random() * weights.reduce((sum, w) => sum + w, 0);
    for (let i = 0; i < pool.length; i += 1) {
        roll -= weights[i];
        if (roll <= 0) return pool[i];
    }
    return pool[pool.length - 1];
}

/** Year summary: completed games, hours on games active that year, top games, busiest month (0-11 | null). */
export function computeWrapped(items, year) {
    const months = new Array(12).fill(0);
    const active = [];
    let completed = 0;
    for (const item of items) {
        const done = item.status === 'completed' ? dateInYear(item.completedAt, year) : null;
        const started = dateInYear(item.startedAt, year);
        const played = dateInYear(item.lastPlayed, year);
        if (done) {
            completed += 1;
            months[done.getMonth()] += 2;
        }
        if (started) months[started.getMonth()] += 1;
        if (played) months[played.getMonth()] += 1;
        if (done || started || played) active.push(item);
    }
    const hours = Math.round(active.reduce((sum, item) => sum + itemHours(item), 0));
    const topGames = [...active]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0) || itemHours(b) - itemHours(a))
        .slice(0, 5);
    const peak = Math.max(...months);
    return {
        year,
        completed,
        played: active.length,
        hours,
        topGames,
        mostActiveMonth: peak > 0 ? months.indexOf(peak) : null,
        months,
    };
}
