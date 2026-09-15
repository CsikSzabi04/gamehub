// Release reminders of the signed-in user: users/{uid}/reminders/{gameKey}
//   { gameKey, name, image, releaseDate: 'YYYY-MM-DD' | null (TBA), releaseText, url, platforms: [],
//     notified: false, notifiedAt: null, createdAt }
// One shared Firestore listener per user, no matter how many components use the hook.
import { useCallback, useContext, useSyncExternalStore } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { firestore } from '../lib/firebase.js';

const EMPTY = { uid: null, loading: false, items: [], byKey: {} };
let snapshot = EMPTY;
let activeUid = null;
let unsubscribeFirestore = null;
let idleTimer = null;
const listeners = new Set();

function emit(next) {
    snapshot = next;
    listeners.forEach(fn => fn());
}

function connect(uid) {
    if (activeUid === uid) return;
    unsubscribeFirestore?.();
    unsubscribeFirestore = null;
    activeUid = uid;
    if (!uid) {
        emit(EMPTY);
        return;
    }
    emit(snapshot.uid === uid ? snapshot : { ...EMPTY, uid, loading: true });
    let cancelled = false;
    let unsub = null;
    unsubscribeFirestore = () => {
        cancelled = true;
        unsub?.();
    };
    firestore().then(({ db, collection, onSnapshot }) => {
        if (cancelled) return;
        unsub = onSnapshot(
            collection(db, 'users', uid, 'reminders'),
            snap => {
                const items = snap.docs.map(d => ({ ...d.data(), gameKey: d.id }));
                items.sort((a, b) => (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999') || String(a.name).localeCompare(String(b.name)));
                emit({ uid, loading: false, items, byKey: Object.fromEntries(items.map(i => [i.gameKey, i])) });
            },
            error => {
                console.error('reminders:', error);
                emit({ ...EMPTY, uid });
            },
        );
    }).catch(() => emit({ ...EMPTY, uid }));
}

function subscribe(fn) {
    listeners.add(fn);
    clearTimeout(idleTimer);
    return () => {
        listeners.delete(fn);
        if (listeners.size) return;
        // Keep the data, but stop listening a while after the last component is gone
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (listeners.size) return;
            unsubscribeFirestore?.();
            unsubscribeFirestore = null;
            activeUid = null;
        }, 30000);
    };
}

const clip = (value, max) => String(value || '').trim().slice(0, max);

/** Writes a reminder. entry: { gameKey, name, image, releaseDate, releaseText, url, platforms } */
export async function addReminder(user, entry) {
    if (!user?.uid || !entry?.gameKey) return;
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    const image = typeof entry.image === 'string' && /^https?:\/\//.test(entry.image) ? entry.image.slice(0, 500) : null;
    await setDoc(doc(db, 'users', user.uid, 'reminders', clip(entry.gameKey, 80)), {
        gameKey: clip(entry.gameKey, 80),
        name: clip(entry.name, 120) || entry.gameKey,
        image,
        releaseDate: /^\d{4}-\d{2}-\d{2}$/.test(entry.releaseDate || '') ? entry.releaseDate : null,
        releaseText: clip(entry.releaseText, 40) || null,
        url: typeof entry.url === 'string' && entry.url.startsWith('/') ? entry.url.slice(0, 200) : '/calendar',
        platforms: (entry.platforms || []).map(p => clip(p, 20)).filter(Boolean).slice(0, 8),
        notified: false,
        notifiedAt: null,
        createdAt: serverTimestamp(),
    });
}

export async function removeReminder(user, gameKey) {
    if (!user?.uid || !gameKey) return;
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'users', user.uid, 'reminders', gameKey));
}

/** { reminders, byKey, loading, user, add(entry), remove(gameKey) } */
export function useReminders() {
    const { user } = useContext(UserContext) || {};
    const uid = user?.uid || null;
    const subscribeForUser = useCallback(fn => {
        const unsubscribe = subscribe(fn);
        connect(uid);
        return unsubscribe;
    }, [uid]);
    const state = useSyncExternalStore(
        subscribeForUser,
        () => snapshot,
        () => EMPTY,
    );
    const current = state.uid === uid ? state : { ...EMPTY, loading: Boolean(uid) };
    return {
        user,
        reminders: current.items,
        byKey: current.byKey,
        loading: current.loading,
        add: entry => addReminder(user, entry),
        remove: gameKey => removeReminder(user, gameKey),
    };
}
