// Public profile data helpers shared by the profile, feed, leaderboard and challenges pages.
//
//   const found = await findProfileByUsername('Alex');     // { uid, ...users/{uid} } | null | { uid, private: true }
//   const profiles = await fetchProfiles(['uid1', 'uid2']);  // Map uid -> profile (unreadable ones are skipped)
//   const top = await loadTopUsers('xp');                   // public users ordered by xp (cached for a minute)
import { firestore, toDate } from '../lib/firebase.js';
import { apiGet } from '../lib/api.js';
import { getLevelInfo } from '../Components/profile/profileUtils.js';
import { fromPublicDoc } from './publicProfile.js';

export const profileHref = username => `/u/${encodeURIComponent(username || '')}`;

export const isPublicProfile = p => p?.isPublic !== false;

/** Level info for a users/{uid} doc: uses the stored xp, falls back to the stored level. */
export function levelInfoOf(p) {
    const xp = Number(p?.xp);
    if (Number.isFinite(xp) && xp > 0) return getLevelInfo(xp);
    const level = Math.max(1, Number(p?.level) || 1);
    return getLevelInfo(50 * level * (level - 1));
}

/* ---------- Profile lookups ---------- */

const profileCache = new Map(); // uid -> { data, ts }
const PROFILE_TTL = 60_000;

function remember(uid, data) {
    profileCache.set(uid, { data, ts: Date.now() });
    return data;
}

export async function findProfileByUsername(username) {
    const name = String(username || '').trim();
    if (!name) return null;
    const { db, collection, query, where, limit, getDocs } = await firestore();
    // publicProfiles/{uid} is the public mirror of users/{uid} (see publicProfile.js)
    const users = collection(db, 'publicProfiles');
    let denied = false;
    for (const q of [
        query(users, where('usernameLower', '==', name.toLowerCase()), limit(1)),
        query(users, where('username', '==', name), limit(1)),
    ]) {
        try {
            const snap = await getDocs(q);
            if (!snap.empty) {
                const docSnap = snap.docs[0];
                return remember(docSnap.id, fromPublicDoc(docSnap.id, docSnap.data()));
            }
        } catch (error) {
            if (error?.code === 'permission-denied') denied = true;
            else console.error('Profile lookup failed:', error);
        }
    }
    return denied ? { private: true } : null;
}

/** Reads users/{uid} docs one by one (so a single private/denied doc doesn't fail the batch). */
export async function fetchProfiles(uids) {
    const unique = [...new Set(uids.filter(Boolean))];
    const result = new Map();
    const missing = [];
    for (const uid of unique) {
        const hit = profileCache.get(uid);
        if (hit && Date.now() - hit.ts < PROFILE_TTL) {
            if (hit.data) result.set(uid, hit.data);
        } else {
            missing.push(uid);
        }
    }
    if (missing.length) {
        const { db, doc, getDoc } = await firestore();
        await Promise.all(missing.map(async uid => {
            try {
                const snap = await getDoc(doc(db, 'publicProfiles', uid));
                const data = snap.exists() ? fromPublicDoc(uid, snap.data()) : null;
                remember(uid, data);
                if (data) result.set(uid, data);
            } catch {
                remember(uid, null);
            }
        }));
    }
    return result;
}

const topCache = new Map(); // field -> { promise, ts }

/** Public users ordered by a numeric field (single-field orderBy, limit 100). */
export function loadTopUsers(field = 'xp') {
    const hit = topCache.get(field);
    if (hit && Date.now() - hit.ts < PROFILE_TTL) return hit.promise;
    const promise = (async () => {
        const { db, collection, query, orderBy, limit, getDocs } = await firestore();
        const snap = await getDocs(query(collection(db, 'publicProfiles'), orderBy(field, 'desc'), limit(100)));
        return snap.docs
            .map(d => fromPublicDoc(d.id, d.data()))
            .filter(p => isPublicProfile(p) && p.username);
    })();
    promise.catch(() => topCache.delete(field));
    topCache.set(field, { promise, ts: Date.now() });
    return promise;
}

/* ---------- Activity ---------- */

const byNewest = (a, b) => (toDate(b.createdAt)?.getTime() || Date.now()) - (toDate(a.createdAt)?.getTime() || Date.now());

/**
 * Activity of the given users, newest first. Uses `in` chunks of 30; tries the indexed
 * (uid + createdAt) query first and falls back to an unordered read sorted in memory.
 */
export async function loadActivityFor(uids, max = 50) {
    const list = [...new Set(uids.filter(Boolean))];
    if (!list.length) return [];
    const { db, collection, query, where, orderBy, limit, getDocs } = await firestore();
    const chunks = [];
    for (let i = 0; i < list.length; i += 30) chunks.push(list.slice(i, i + 30));

    const results = await Promise.all(chunks.map(async chunk => {
        const filter = chunk.length === 1 ? where('uid', '==', chunk[0]) : where('uid', 'in', chunk);
        try {
            const snap = await getDocs(query(collection(db, 'activity'), filter, orderBy('createdAt', 'desc'), limit(max)));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            if (error?.code !== 'failed-precondition') throw error;
            const snap = await getDocs(query(collection(db, 'activity'), filter, limit(400)));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
    }));
    return results.flat().sort(byNewest).slice(0, max);
}

export async function loadRecentActivity(max = 50) {
    const { db, collection, query, orderBy, limit, getDocs } = await firestore();
    const snap = await getDocs(query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(max)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ---------- Reviews (backend) ---------- */

export const reviewDate = review => toDate(review?.createdAt?._seconds ? review.createdAt._seconds * 1000 : review?.createdAt);

export async function loadUserReviews(uid) {
    if (!uid) return [];
    const all = await apiGet('/get-all-reviews');
    return (Array.isArray(all) ? all : [])
        .filter(r => r && (r.userId === uid || r.uid === uid))
        .sort((a, b) => (reviewDate(b)?.getTime() || 0) - (reviewDate(a)?.getTime() || 0));
}

/* ---------- Time ---------- */

const UNITS = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

export function relativeTime(value, locale) {
    const date = toDate(value);
    if (!date) return '';
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return rtf.format(0, 'second');
}
