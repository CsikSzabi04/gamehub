// Achievements & trophies synced by the backend (routes/achievements.js). Clients only read Firestore.
//
//   users/{uid}.achievementStats                { unlocked, total, games, perfect, rare, ultraRare, hunterPoints,
//                                                gamerscore, trophyPoints, trophies, byPlatform, recent[], rarest[] }
//   users/{uid}.platformSync.{steam|xbox|psn}  { status: 'running'|'ok'|'error', done, total, lastSyncAt, error, autoSync, partial, ... }
//   users/{uid}/achievements/{gameKey}          per-game summary (unlocked, total, perfect, points, nameKey, recent, rarest ...)
//   users/{uid}/achievementItems/{gameKey}      { items: [{ id, name, desc, icon, unlocked, at, rarity, hidden, type?, gs? }] }
//
//   const { stats, sync } = useAchievementOverview(uid);   // live
//   const { games, loading } = useAchievementGames(uid);    // live
//   await startSync(user, 'steam');  await connectPlatform(user, 'psn', npsso);
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { firestore } from '../lib/firebase.js';
import { normalizeTitle } from '../lib/games.js';

export const SYNC_PLATFORMS = ['steam', 'xbox', 'psn'];
const STALE_RUNNING_MS = 30 * 60 * 1000;

/** Same key the backend stores as `nameKey` (drops PlayStation "Trophies" / platform suffixes). */
export function achievementTitleKey(name) {
    return normalizeTitle(String(name || '')
        .toLowerCase()
        .replace(/\b(trophies|trophy set)\b/g, '')
        .replace(/\((ps3|ps4|ps5|ps vita|psvita)\)/g, '')).slice(0, 120);
}

/** A "running" status that is older than 30 minutes died with a server restart. */
export function isSyncRunning(sync) {
    if (sync?.status !== 'running') return false;
    const started = Date.parse(sync.startedAt || '');
    return !started || Date.now() - started < STALE_RUNNING_MS;
}

export const SYNC_ERRORS = ['invalid_input', 'invalid_credentials', 'private', 'rate_limited', 'cooldown', 'running', 'no_credentials', 'no_account', 'not_configured', 'not_deployed', 'upstream'];

/** Backend error / stored status error -> a key of achievements.errors. */
export function errorCodeOf(error) {
    const code = typeof error === 'string' ? error : error?.data?.code || (error?.status === 401 ? 'invalid_credentials' : error?.status === 404 ? 'not_deployed' : 'upstream');
    return SYNC_ERRORS.includes(code) ? code : 'upstream';
}

/* ───────── Backend calls ───────── */

export const getSyncConfig = () => apiGet('/platforms/config');
export const startSync = (user, platform, credential) => apiPost('/platforms/sync', credential ? { platform, credential } : { platform }, user);
export const connectPlatform = (user, platform, credential, remember = true) => apiPost('/platforms/connect', { platform, credential, remember }, user);
export const disconnectPlatform = (user, platform, removeData) => apiPost('/platforms/disconnect', { platform, removeData: Boolean(removeData) }, user);

/* ───────── Firestore reads ───────── */

/** Live users/{uid} fields: achievementStats + platformSync. */
export function useAchievementOverview(uid) {
    const [state, setState] = useState({ uid: null, stats: null, sync: {} });
    useEffect(() => {
        if (!uid) return undefined;
        let cancelled = false;
        let unsubscribe = () => {};
        firestore().then(({ db, doc, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                doc(db, 'users', uid),
                snap => {
                    const data = snap.data() || {};
                    setState({ uid, stats: data.achievementStats || null, sync: data.platformSync || {} });
                },
                error => console.error('Could not load achievement overview:', error),
            );
        }).catch(error => console.error('Could not load Firestore:', error));
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [uid]);
    const ready = Boolean(uid) && state.uid === uid;
    return { stats: ready ? state.stats : null, sync: ready ? state.sync : {}, loading: Boolean(uid) && !ready };
}

/** Live list of per-game summaries (only games that have achievements). */
export function useAchievementGames(uid) {
    const [state, setState] = useState({ uid: null, games: [] });
    useEffect(() => {
        if (!uid) return undefined;
        let cancelled = false;
        let unsubscribe = () => {};
        firestore().then(({ db, collection, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                collection(db, 'users', uid, 'achievements'),
                snap => setState({ uid, games: snap.docs.map(d => ({ ...d.data(), gameKey: d.id })).filter(g => g.total > 0) }),
                error => {
                    console.error('Could not load achievements:', error);
                    setState({ uid, games: [] });
                },
            );
        }).catch(error => console.error('Could not load Firestore:', error));
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [uid]);
    const ready = Boolean(uid) && state.uid === uid;
    return { games: ready ? state.games : [], loading: Boolean(uid) && !ready };
}

export async function getAchievementItems(uid, gameKey) {
    const { db, doc, getDoc } = await firestore();
    const snap = await getDoc(doc(db, 'users', uid, 'achievementItems', gameKey));
    return snap.exists() ? snap.data().items || [] : [];
}

/**
 * The signed-in user's synced achievements for a game page: the Steam entry by app id,
 * plus Xbox / PlayStation entries with the same title. -> [summary]
 */
export async function findGameAchievements(uid, { steamAppId, name }) {
    const { db, collection, doc, getDoc, getDocs, query, where, limit } = await firestore();
    const col = collection(db, 'users', uid, 'achievements');
    const found = new Map();
    if (steamAppId) {
        const snap = await getDoc(doc(col, `steam-${steamAppId}`));
        if (snap.exists()) found.set(snap.id, { ...snap.data(), gameKey: snap.id });
    }
    const key = achievementTitleKey(name);
    if (key) {
        const snap = await getDocs(query(col, where('nameKey', '==', key), limit(6)));
        snap.docs.forEach(d => found.set(d.id, { ...d.data(), gameKey: d.id }));
    }
    return [...found.values()].filter(g => g.total > 0);
}
