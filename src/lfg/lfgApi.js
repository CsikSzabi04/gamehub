// Firestore access for LFG posts and join requests.
//
//   lfgPosts/{postId}                        public post (no contact info)
//   lfgPosts/{postId}/requests/{requesterUid} join request (contact visible to owner + requester only)
//   reports/{auto}                           abuse reports
import { firestore } from '../lib/firebase.js';
import { apiPost } from '../lib/api.js';
import { LIMITS, MAX_EXPIRY_HOURS, clip, hoursMs, millis } from './constants.js';

const withId = snap => ({ id: snap.id, ...snap.data() });

/** Starts an onSnapshot once the SDK is loaded; returns a sync unsubscribe. */
function live(build, onData, onError) {
    let unsubscribe = null;
    let cancelled = false;
    firestore()
        .then(fs => {
            if (cancelled) return;
            unsubscribe = fs.onSnapshot(build(fs), onData, error => onError?.(error));
        })
        .catch(error => onError?.(error));
    return () => {
        cancelled = true;
        unsubscribe?.();
    };
}

/** Fire-and-forget push/in-app notification through the backend (it re-checks the documents). */
export function notifySocial(user, body) {
    apiPost('/notify/social', body, user).catch(() => {});
}

/** All not-yet-expired posts, soonest expiry first (single-field query, no composite index). */
export function subscribePosts(onData, onError) {
    return live(
        ({ db, collection, query, where, orderBy, limit, Timestamp }) =>
            query(collection(db, 'lfgPosts'), where('expiresAt', '>', Timestamp.now()), orderBy('expiresAt'), limit(300)),
        snap => onData(snap.docs.map(withId)),
        onError,
    );
}

export function subscribePost(postId, onData, onError) {
    return live(
        ({ db, doc }) => doc(db, 'lfgPosts', postId),
        snap => onData(snap.exists() ? withId(snap) : null),
        onError,
    );
}

/** Every post of a user, also expired ones (for the daily limit). Single-field equality query. */
export async function fetchOwnPosts(uid) {
    const { db, collection, query, where, getDocs } = await firestore();
    const snap = await getDocs(query(collection(db, 'lfgPosts'), where('uid', '==', uid)));
    return snap.docs.map(withId);
}

export async function createPost(user, profile, data) {
    const { db, collection, addDoc, serverTimestamp, Timestamp } = await firestore();
    const { expiresAtMs, ...fields } = data;
    const ref = await addDoc(collection(db, 'lfgPosts'), {
        ...fields,
        uid: user.uid,
        username: clip(profile?.username || user.displayName || 'Player', 40),
        filled: 0,
        closed: false,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(expiresAtMs),
    });
    return ref.id;
}

export async function setPostClosed(postId, closed) {
    const { db, doc, updateDoc } = await firestore();
    await updateDoc(doc(db, 'lfgPosts', postId), { closed: Boolean(closed) });
}

/** Adds `hours` to the expiry (counting from now when already expired), capped at 72 h from now. */
export async function extendPost(post, hours) {
    const { db, doc, updateDoc, Timestamp } = await firestore();
    const now = Date.now();
    const base = Math.max(now, millis(post.expiresAt) || now);
    const next = Math.min(base + hoursMs(hours), now + hoursMs(MAX_EXPIRY_HOURS));
    await updateDoc(doc(db, 'lfgPosts', post.id), { expiresAt: Timestamp.fromMillis(next) });
}

export async function deletePost(postId) {
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'lfgPosts', postId));
}

// ---- requests ------------------------------------------------------------------------------

/** Owner: all requests of a post. */
export function subscribeRequests(postId, onData, onError) {
    return live(
        ({ db, collection }) => collection(db, 'lfgPosts', postId, 'requests'),
        snap => onData(snap.docs.map(d => ({ ...d.data(), id: d.id, postId }))),
        onError,
    );
}

/** Requester: own request on one post (null when none). */
export function subscribeMyRequest(postId, uid, onData, onError) {
    return live(
        ({ db, doc }) => doc(db, 'lfgPosts', postId, 'requests', uid),
        snap => onData(snap.exists() ? { ...snap.data(), id: snap.id, postId } : null),
        onError,
    );
}

/**
 * Requester: all own requests across posts. Needs a collection-group single-field index
 * exemption on requests.uid – onError fires (failed-precondition) when it is missing.
 */
export function subscribeMyRequests(uid, onData, onError) {
    return live(
        ({ db, collectionGroup, query, where }) => query(collectionGroup(db, 'requests'), where('uid', '==', uid)),
        snap => onData(snap.docs
            .filter(d => d.ref.parent.parent?.parent?.id === 'lfgPosts')
            .map(d => ({ ...d.data(), id: d.id, postId: d.ref.parent.parent.id }))),
        onError,
    );
}

/** Fallback without the collection-group index: read own request doc on each given post. */
export async function fetchMyRequests(uid, postIds) {
    const { db, doc, getDoc } = await firestore();
    const results = {};
    for (let i = 0; i < postIds.length; i += 10) {
        const chunk = postIds.slice(i, i + 10);
        const snaps = await Promise.all(chunk.map(id => getDoc(doc(db, 'lfgPosts', id, 'requests', uid)).catch(() => null)));
        snaps.forEach((snap, index) => {
            results[chunk[index]] = snap?.exists() ? { ...snap.data(), id: snap.id, postId: chunk[index] } : null;
        });
    }
    return results;
}

export async function sendRequest(user, profile, postId, { message, contact }) {
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    await setDoc(doc(db, 'lfgPosts', postId, 'requests', user.uid), {
        uid: user.uid,
        username: clip(profile?.username || user.displayName || 'Player', 40),
        message: clip(message, LIMITS.message),
        contact: clip(contact, LIMITS.contact),
        status: 'pending',
        ownerContact: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    notifySocial(user, { type: 'lfg-request', postId });
}

export async function cancelRequest(uid, postId) {
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'lfgPosts', postId, 'requests', uid));
}

/** Owner accepts: shares own contact and takes a slot (transaction keeps `filled` consistent). */
export async function acceptRequest(user, postId, requesterUid, ownerContact) {
    const { db, doc, runTransaction, serverTimestamp } = await firestore();
    const postRef = doc(db, 'lfgPosts', postId);
    const requestRef = doc(db, 'lfgPosts', postId, 'requests', requesterUid);
    await runTransaction(db, async tx => {
        const postSnap = await tx.get(postRef);
        const requestSnap = await tx.get(requestRef);
        if (!postSnap.exists() || !requestSnap.exists()) throw Object.assign(new Error('not-found'), { code: 'not-found' });
        const post = postSnap.data();
        const wasAccepted = requestSnap.data().status === 'accepted';
        if (!wasAccepted && (post.filled || 0) >= post.slots) throw Object.assign(new Error('full'), { code: 'full' });
        tx.update(requestRef, { status: 'accepted', ownerContact: clip(ownerContact, LIMITS.contact), updatedAt: serverTimestamp() });
        if (!wasAccepted) tx.update(postRef, { filled: (post.filled || 0) + 1 });
    });
    notifySocial(user, { type: 'lfg-accepted', postId, requesterUid });
}

/** Owner declines (or removes an accepted player, freeing the slot). */
export async function declineRequest(user, postId, requesterUid) {
    const { db, doc, runTransaction, serverTimestamp } = await firestore();
    const postRef = doc(db, 'lfgPosts', postId);
    const requestRef = doc(db, 'lfgPosts', postId, 'requests', requesterUid);
    await runTransaction(db, async tx => {
        const postSnap = await tx.get(postRef);
        const requestSnap = await tx.get(requestRef);
        if (!postSnap.exists() || !requestSnap.exists()) throw Object.assign(new Error('not-found'), { code: 'not-found' });
        const wasAccepted = requestSnap.data().status === 'accepted';
        tx.update(requestRef, { status: 'declined', ownerContact: null, updatedAt: serverTimestamp() });
        if (wasAccepted) tx.update(postRef, { filled: Math.max(0, (postSnap.data().filled || 0) - 1) });
    });
    notifySocial(user, { type: 'lfg-declined', postId, requesterUid });
}

// ---- reports -------------------------------------------------------------------------------

/** type: 'lfg' (targetId = postId) | 'lfg-user' (targetId = reported uid) */
export async function reportContent(user, { type, targetId, reason, postId = null }) {
    const { db, collection, addDoc, serverTimestamp } = await firestore();
    await addDoc(collection(db, 'reports'), {
        type,
        targetId,
        postId,
        reason: clip(reason, LIMITS.reason),
        uid: user.uid,
        createdAt: serverTimestamp(),
    });
}
