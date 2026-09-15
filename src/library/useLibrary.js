// React access to the signed-in user's game library.
//
//   const { items, loading, byKey, setStatus, update, remove, importItems } = useLibrary();
//   await setStatus(game, 'completed');          // game: { gameKey | source+id, name, image }
//   await update('steam-730', { rating: 5, note: 'GOTY', playtimeHours: 120 });
//   await remove('steam-730');
//   const added = await importItems([{ gameKey, name, image, source, sourceId, status, steamPlaytimeHours, lastPlayed }]);
//
//   const { item, loading, setStatus, remove } = useLibraryItem('steam-730');  // one doc only (game page)
//   const item = await getLibraryItem(uid, 'steam-730');                        // non-hook read
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { firestore } from '../lib/firebase.js';
import {
    LIBRARY_STATUSES,
    getLibraryItem,
    importLibraryItems,
    isValidKey,
    removeLibraryItem,
    scheduleStatsSync,
    setLibraryStatus,
    statsDiffer,
    computeLibraryStats,
    updateLibraryItem,
} from './libraryApi.js';

export { LIBRARY_STATUSES, getLibraryItem };

function useStatsUpdater() {
    const { setProfile } = useContext(UserContext) || {};
    return useCallback(stats => {
        setProfile?.(current => (current ? { ...current, libraryStats: { ...stats, updatedAt: new Date() } } : current));
    }, [setProfile]);
}

export function useLibrary() {
    const { user, profile } = useContext(UserContext) || {};
    const uid = user?.uid || null;
    const [state, setState] = useState({ uid: null, items: [], loaded: false });
    const itemsRef = useRef([]);
    const checkedStatsRef = useRef(null);
    const onStats = useStatsUpdater();

    useEffect(() => {
        if (!uid) return undefined;
        let cancelled = false;
        let unsubscribe = () => {};
        firestore().then(({ db, collection, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                collection(db, 'users', uid, 'library'),
                snap => {
                    const items = snap.docs.map(d => ({ ...d.data({ serverTimestamps: 'estimate' }), gameKey: d.id }));
                    itemsRef.current = items;
                    setState({ uid, items, loaded: true });
                },
                error => {
                    console.error('Could not load library:', error);
                    setState(current => ({ uid, items: current.uid === uid ? current.items : [], loaded: true }));
                },
            );
        }).catch(error => console.error('Could not load Firestore:', error));
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [uid]);

    const ready = Boolean(uid) && state.uid === uid;
    const items = useMemo(() => (ready ? state.items : []), [ready, state.items]);
    const loading = Boolean(uid) && (!ready || !state.loaded);

    // Repair users/{uid}.libraryStats once per session if it drifted (e.g. edits from another device)
    useEffect(() => {
        if (!ready || !state.loaded || checkedStatsRef.current === uid) return;
        checkedStatsRef.current = uid;
        if (statsDiffer(profile?.libraryStats, computeLibraryStats(state.items))) {
            scheduleStatsSync(uid, () => itemsRef.current, onStats, 0);
        }
    }, [ready, state.loaded, state.items, uid, profile?.libraryStats, onStats]);

    const byKey = useMemo(() => Object.fromEntries(items.map(item => [item.gameKey, item])), [items]);
    const byKeyRef = useRef(byKey);
    byKeyRef.current = byKey;

    const sync = useCallback(() => scheduleStatsSync(uid, () => itemsRef.current, onStats), [uid, onStats]);

    const setStatus = useCallback(async (gameMeta, status) => {
        const key = gameMeta?.gameKey || (gameMeta?.source && gameMeta?.id != null ? `${gameMeta.source}-${gameMeta.id}` : '');
        const existing = ready && state.loaded ? (byKeyRef.current[key] || null) : undefined;
        const result = await setLibraryStatus(user, profile, gameMeta, status, existing);
        sync();
        return result;
    }, [user, profile, ready, state.loaded, sync]);

    const update = useCallback(async (key, patch) => {
        await updateLibraryItem(uid, key, patch);
    }, [uid]);

    const remove = useCallback(async key => {
        await removeLibraryItem(uid, key);
        sync();
    }, [uid, sync]);

    const importItems = useCallback(async list => {
        const added = await importLibraryItems(uid, list, new Set(Object.keys(byKeyRef.current)));
        if (added) sync();
        return added;
    }, [uid, sync]);

    return { items, loading, byKey, setStatus, update, remove, importItems };
}

/** Live view of a single library entry (cheap: one document listener). */
export function useLibraryItem(key) {
    const { user, profile } = useContext(UserContext) || {};
    const uid = user?.uid || null;
    const [state, setState] = useState({ id: null, item: null });
    const onStats = useStatsUpdater();
    const id = uid && isValidKey(key) ? `${uid}/${key}` : null;

    useEffect(() => {
        if (!id) return undefined;
        let cancelled = false;
        let unsubscribe = () => {};
        const [ownerUid, gameKey] = id.split('/');
        firestore().then(({ db, doc, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                doc(db, 'users', ownerUid, 'library', gameKey),
                snap => setState({ id, item: snap.exists() ? { ...snap.data({ serverTimestamps: 'estimate' }), gameKey } : null }),
                error => {
                    console.error('Could not load library item:', error);
                    setState({ id, item: null });
                },
            );
        }).catch(error => console.error('Could not load Firestore:', error));
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [id]);

    const loading = Boolean(id) && state.id !== id;
    const item = state.id === id ? state.item : null;

    const setStatus = useCallback(async (gameMeta, status) => {
        const result = await setLibraryStatus(user, profile, gameMeta, status, loading ? undefined : item);
        scheduleStatsSync(uid, null, onStats);
        return result;
    }, [user, profile, uid, item, loading, onStats]);

    const remove = useCallback(async () => {
        await removeLibraryItem(uid, key);
        scheduleStatsSync(uid, null, onStats);
    }, [uid, key, onStats]);

    return { item, loading, setStatus, remove };
}
