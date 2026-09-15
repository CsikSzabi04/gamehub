// Follow relations: follows/{followerUid}_{followedUid} = { follower, followed, createdAt }
//
//   const { following, loading, busy, toggle } = useFollow(targetUid, targetUsername);
//   const counts = useFollowCounts(uid);   // { followers, following } | null
import { useCallback, useContext, useEffect, useState } from 'react';
import { firestore } from '../lib/firebase.js';
import { apiPost } from '../lib/api.js';
import { UserContext } from '../Features/UserContext.jsx';
import { postActivity } from './activity.js';

const listeners = new Set();

/** Subscribe to follow/unfollow actions made in this tab: fn({ follower, followed, following }). */
export function onFollowChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

const followingCache = new Map(); // uid -> Promise<string[]>

/** Uids the given user follows (max 500). */
export function fetchFollowingUids(uid, { fresh = false } = {}) {
    if (!uid) return Promise.resolve([]);
    if (fresh || !followingCache.has(uid)) {
        const promise = (async () => {
            const { db, collection, query, where, limit, getDocs } = await firestore();
            const snap = await getDocs(query(collection(db, 'follows'), where('follower', '==', uid), limit(500)));
            return snap.docs.map(d => d.data().followed).filter(Boolean);
        })();
        promise.catch(() => followingCache.delete(uid));
        followingCache.set(uid, promise);
    }
    return followingCache.get(uid);
}

/** Follow docs for a list modal: kind 'followers' | 'following' -> [{ uid, createdAt }] */
export async function loadFollowList(uid, kind, max = 300) {
    const { db, collection, query, where, limit, getDocs } = await firestore();
    const field = kind === 'followers' ? 'followed' : 'follower';
    const other = kind === 'followers' ? 'follower' : 'followed';
    const snap = await getDocs(query(collection(db, 'follows'), where(field, '==', uid), limit(max)));
    return snap.docs
        .map(d => ({ uid: d.data()[other], createdAt: d.data().createdAt }))
        .filter(item => item.uid)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export function useFollowCounts(uid) {
    const [counts, setCounts] = useState(null);

    useEffect(() => {
        if (!uid) return undefined;
        let alive = true;
        const load = async () => {
            try {
                const { db, collection, query, where, getCountFromServer } = await firestore();
                const follows = collection(db, 'follows');
                const [followers, following] = await Promise.all([
                    getCountFromServer(query(follows, where('followed', '==', uid))),
                    getCountFromServer(query(follows, where('follower', '==', uid))),
                ]);
                if (alive) setCounts({ followers: followers.data().count, following: following.data().count });
            } catch (error) {
                console.error('Follow counts failed:', error);
                if (alive) setCounts({ followers: 0, following: 0 });
            }
        };
        load();
        const off = onFollowChange(change => {
            if (!alive) return;
            if (change.followed === uid) setCounts(c => c && { ...c, followers: Math.max(0, c.followers + (change.following ? 1 : -1)) });
            if (change.follower === uid) setCounts(c => c && { ...c, following: Math.max(0, c.following + (change.following ? 1 : -1)) });
        });
        return () => {
            alive = false;
            off();
        };
    }, [uid]);

    return counts;
}

export function useFollow(targetUid, targetUsername) {
    const { user, profile } = useContext(UserContext) || {};
    const me = user?.uid;
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(Boolean(me && targetUid));
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!me || !targetUid || me === targetUid) {
            setFollowing(false);
            setLoading(false);
            return undefined;
        }
        let alive = true;
        setLoading(true);
        firestore()
            .then(({ db, doc, getDoc }) => getDoc(doc(db, 'follows', `${me}_${targetUid}`)))
            .then(snap => alive && setFollowing(snap.exists()))
            .catch(() => alive && setFollowing(false))
            .finally(() => alive && setLoading(false));
        const off = onFollowChange(change => {
            if (alive && change.follower === me && change.followed === targetUid) setFollowing(change.following);
        });
        return () => {
            alive = false;
            off();
        };
    }, [me, targetUid]);

    const toggle = useCallback(async () => {
        if (!user || !targetUid || user.uid === targetUid || busy) return false;
        setBusy(true);
        const next = !following;
        try {
            const { db, doc, setDoc, deleteDoc, serverTimestamp } = await firestore();
            const ref = doc(db, 'follows', `${user.uid}_${targetUid}`);
            if (next) {
                await setDoc(ref, { follower: user.uid, followed: targetUid, createdAt: serverTimestamp() });
            } else {
                await deleteDoc(ref);
            }
            setFollowing(next);
            followingCache.delete(user.uid);
            listeners.forEach(fn => fn({ follower: user.uid, followed: targetUid, following: next }));
            if (next) {
                apiPost('/notify/social', { type: 'follow', targetUid }, user).catch(() => {});
                postActivity(user, profile, {
                    type: 'follow',
                    text: targetUsername ? String(targetUsername).slice(0, 40) : null,
                    url: targetUsername ? `/u/${encodeURIComponent(targetUsername)}` : null,
                });
            }
            return true;
        } catch (error) {
            console.error('Follow failed:', error);
            return false;
        } finally {
            setBusy(false);
        }
    }, [user, profile, targetUid, targetUsername, following, busy]);

    return { following, loading, busy, toggle, canFollow: Boolean(targetUid) && me !== targetUid };
}
