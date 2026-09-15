import { useCallback, useEffect, useState } from 'react';
import { firestore } from '../lib/firebase.js';
import { MAX_VOTE_DOCS } from './tierUtils.js';

// Session cache: docId -> { votes: { [uid]: tiers }, ts }
const cache = new Map();
const CACHE_MS = 2 * 60 * 1000;

/** All (≤ 500) votes of tierVotes/{docId}/votes as { [uid]: tiers }. */
export function useTierVotes(docId) {
    const cached = docId ? cache.get(docId) : null;
    const [state, setState] = useState(() => ({ docId, votes: cached?.votes || null, error: null }));
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!docId) return undefined;
        const hit = cache.get(docId);
        if (hit && Date.now() - hit.ts < CACHE_MS && reloadKey === 0) {
            setState({ docId, votes: hit.votes, error: null });
            return undefined;
        }
        let cancelled = false;
        setState(prev => ({ docId, votes: prev.docId === docId ? prev.votes : hit?.votes || null, error: null }));
        (async () => {
            try {
                const { db, collection, query, limit, getDocs } = await firestore();
                const snap = await getDocs(query(collection(db, 'tierVotes', docId, 'votes'), limit(MAX_VOTE_DOCS)));
                const votes = {};
                snap.forEach(d => {
                    votes[d.id] = d.data()?.tiers || {};
                });
                cache.set(docId, { votes, ts: Date.now() });
                if (!cancelled) setState({ docId, votes, error: null });
            } catch (error) {
                console.error('Could not load tier votes:', error);
                if (!cancelled) setState(prev => ({ docId, votes: prev.docId === docId ? prev.votes : null, error }));
            }
        })();
        return () => { cancelled = true; };
    }, [docId, reloadKey]);

    /** Replace one user's vote locally after saving (no refetch). */
    const setVote = useCallback((uid, tiers) => {
        if (!docId || !uid) return;
        const current = cache.get(docId)?.votes || {};
        const votes = { ...current, [uid]: tiers };
        cache.set(docId, { votes, ts: Date.now() });
        setState({ docId, votes, error: null });
    }, [docId]);

    const reload = useCallback(() => setReloadKey(k => k + 1), []);

    const fresh = state.docId === docId;
    return { votes: fresh ? state.votes : null, error: fresh ? state.error : null, setVote, reload };
}
