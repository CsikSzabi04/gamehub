// Backend calls for the recommender (routes/recommendations.js) and the "not interested" feedback in Firestore.
//
//   const { apps, names } = await fetchRecoApps([1145360], [{ key: 'psn-X', name: 'God of War' }], 'hu');
//   const { apps } = await fetchRecoCandidates([42804, 29482], 'hu');
//   const { tags } = await fetchRecoTags('hu');            // { [tagid]: name }
//
// users/{uid}/recoFeedback/{appid} = { appid, name, image, verdict: 'hide', createdAt }
// users/{uid}.forYou = { picks: teaserSnapshot(), updatedAt }   (home page teaser)
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { firestore } from '../lib/firebase.js';

export const fetchRecoApps = (appids, names, cc) => apiPost('/reco/apps', { appids, names, cc });
export const fetchRecoCandidates = (tags, cc) => apiGet(`/reco/candidates?tags=${tags.join(',')}&cc=${encodeURIComponent(cc)}`);
export const fetchRecoTags = lang => apiGet(`/reco/tags?l=${encodeURIComponent(lang)}`);

/** Backend error -> key of forYou.errors */
export const recoErrorCode = error => (error?.status === 404 ? 'not_deployed' : 'upstream');

/** Live list of hidden appids. */
export function useRecoFeedback(uid) {
    const [state, setState] = useState({ uid: null, hidden: [] });
    useEffect(() => {
        if (!uid) return undefined;
        let cancelled = false;
        let unsubscribe = () => {};
        firestore().then(({ db, collection, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                collection(db, 'users', uid, 'recoFeedback'),
                snap => setState({ uid, hidden: snap.docs.filter(d => d.data().verdict === 'hide').map(d => Number(d.id)).filter(Boolean) }),
                error => {
                    console.error('Could not load recommendation feedback:', error);
                    setState({ uid, hidden: [] });
                },
            );
        }).catch(error => console.error('Could not load Firestore:', error));
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [uid]);
    const ready = Boolean(uid) && state.uid === uid;
    return { hidden: ready ? state.hidden : [], loading: Boolean(uid) && !ready };
}

export async function hideRecommendation(uid, game) {
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    await setDoc(doc(db, 'users', uid, 'recoFeedback', String(game.appid)), {
        appid: Number(game.appid),
        name: String(game.name || '').slice(0, 160),
        image: typeof game.image === 'string' && game.image.startsWith('https://') ? game.image.slice(0, 500) : null,
        verdict: 'hide',
        createdAt: serverTimestamp(),
    });
}

export async function clearHiddenRecommendations(uid) {
    const { db, collection, getDocs, writeBatch } = await firestore();
    const snap = await getDocs(collection(db, 'users', uid, 'recoFeedback'));
    for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = writeBatch(db);
        snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
    }
}

export async function saveTeaser(uid, picks) {
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    await setDoc(doc(db, 'users', uid), { forYou: { picks, updatedAt: serverTimestamp() } }, { merge: true });
}
