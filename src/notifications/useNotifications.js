// Live in-app notifications of the signed-in user (users/{uid}/notifications), shared by every
// component on the page through one Firestore listener.
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { firestore } from '../lib/firebase.js';

const LIMIT = 50;
let state = { uid: null, items: [], loaded: false };
let unsubscribe = null;
let refCount = 0;
const listeners = new Set();

const emit = () => listeners.forEach(fn => fn(state));

function updateAppBadge(unread) {
    if (typeof navigator === 'undefined') return;
    if (unread > 0) navigator.setAppBadge?.(unread).catch(() => {});
    else navigator.clearAppBadge?.().catch(() => {});
}

async function start(uid) {
    if (state.uid === uid && unsubscribe) return;
    stop();
    state = { uid, items: [], loaded: false };
    emit();
    const { db, collection, query, orderBy, limit, onSnapshot } = await firestore();
    if (state.uid !== uid) return;
    unsubscribe = onSnapshot(
        query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(LIMIT)),
        snap => {
            state = { uid, loaded: true, items: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
            updateAppBadge(state.items.filter(n => !n.read).length);
            emit();
        },
        error => {
            console.error('Notifications listener:', error);
            state = { ...state, loaded: true };
            emit();
        }
    );
}

function stop() {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
}

export default function useNotifications() {
    const { user } = useContext(UserContext) || {};
    const [snapshot, setSnapshot] = useState(state);
    const uid = user?.uid || null;

    useEffect(() => {
        listeners.add(setSnapshot);
        refCount++;
        if (uid) start(uid);
        else if (state.uid) {
            stop();
            state = { uid: null, items: [], loaded: true };
            emit();
        }
        return () => {
            listeners.delete(setSnapshot);
            refCount--;
            // keep the listener briefly so page changes don't resubscribe
            setTimeout(() => { if (refCount === 0) { stop(); state = { uid: null, items: [], loaded: false }; } }, 5000);
        };
    }, [uid]);

    const items = snapshot.uid === uid ? snapshot.items : [];
    const unread = items.filter(n => !n.read).length;

    async function markRead(id) {
        if (!uid) return;
        const { db, doc, updateDoc } = await firestore();
        await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true }).catch(() => {});
    }

    async function markAllRead() {
        if (!uid) return;
        const { db, doc, writeBatch } = await firestore();
        const batch = writeBatch(db);
        items.filter(n => !n.read).forEach(n => batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true }));
        await batch.commit().catch(() => {});
    }

    async function remove(id) {
        if (!uid) return;
        const { db, doc, deleteDoc } = await firestore();
        await deleteDoc(doc(db, 'users', uid, 'notifications', id)).catch(() => {});
    }

    async function clearAll() {
        if (!uid) return;
        const { db, doc, writeBatch } = await firestore();
        const batch = writeBatch(db);
        items.forEach(n => batch.delete(doc(db, 'users', uid, 'notifications', n.id)));
        await batch.commit().catch(() => {});
    }

    return { items, unread, loaded: snapshot.loaded || !uid, markRead, markAllRead, remove, clearAll };
}
