// React side of the recommender: gathers the signed-in user's library, achievements, hidden games and
// Steam wishlist, loads the store data it needs and runs recoEngine.recommend() on it.
//
//   const reco = useRecommendations('hu');
//   reco.status        'loading' | 'empty' (not enough played / rated games) | 'ready' | 'error'
//   reco.result        { taste, picks, deals, backlog } (backlog and taste arrive before the picks)
//   reco.candidatesLoading, reco.hiddenCount
//   await reco.hide(card); await reco.unhideAll(); await reco.addToWishlist(card);
//
//   const tagNames = useRecoTagNames('hu');   // { [tagid]: 'Roguelike' }
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { useLibrary } from '../library/useLibrary.js';
import { useAchievementGames } from '../achievements/achievementsApi.js';
import { fetchWishlist } from '../steam/steamApi.js';
import { collectSignals, recommend, seedTags, selectInputs, teaserSnapshot } from './recoEngine.js';
import {
    clearHiddenRecommendations, fetchRecoApps, fetchRecoCandidates, fetchRecoTags, hideRecommendation, recoErrorCode, saveTeaser, useRecoFeedback,
} from './recoApi.js';

// Session caches, kept across page visits
const appCache = new Map(); // `${cc}:${appid}` -> app | null (unknown on Steam)
const nameCache = new Map(); // library key -> Steam appid | null
const candidateCache = new Map(); // `${cc}:${tags}` -> [appid]
const tagCache = new Map(); // lang -> { [tagid]: name }
const NO_APPIDS = [];

const TEASER_MAX_AGE_MS = 6 * 60 * 60 * 1000;

async function loadApps(appids, names, cc) {
    const ids = appids.filter(appid => !appCache.has(`${cc}:${appid}`));
    const titles = names.filter(n => !nameCache.has(n.key));
    for (let i = 0; i < Math.max(ids.length, titles.length); i += 500) {
        const chunkIds = ids.slice(i, i + 500);
        const chunkNames = i === 0 ? titles : [];
        if (!chunkIds.length && !chunkNames.length) break;
        const data = await fetchRecoApps(chunkIds, chunkNames, cc);
        for (const app of data?.apps || []) appCache.set(`${cc}:${app.appid}`, app);
        for (const appid of chunkIds) if (!appCache.has(`${cc}:${appid}`)) appCache.set(`${cc}:${appid}`, null);
        for (const { key } of chunkNames) nameCache.set(key, data?.names?.[key] || null);
    }
}

function appsFor(cc) {
    const map = new Map();
    const prefix = `${cc}:`;
    for (const [key, app] of appCache) if (app && key.startsWith(prefix)) map.set(app.appid, app);
    return map;
}

export function useRecommendations(cc) {
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const uid = user?.uid || null;
    const steamId = profile?.steamId || null;
    const { items, loading: libraryLoading, setStatus } = useLibrary();
    const { games: achievements, loading: achievementsLoading } = useAchievementGames(uid);
    const { hidden, loading: feedbackLoading } = useRecoFeedback(uid);
    const [version, setVersion] = useState(0);
    const bump = useCallback(() => setVersion(v => v + 1), []);
    const [loadedKey, setLoadedKey] = useState(null);
    const [error, setError] = useState(null);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [wishlist, setWishlist] = useState({ key: null, appids: [] });
    const lastCandidates = useRef([]);
    const teaserSaved = useRef(false);

    const sourcesReady = Boolean(uid) && !libraryLoading && !achievementsLoading && !feedbackLoading;
    const signals = useMemo(() => (sourcesReady ? collectSignals(items, achievements) : []), [sourcesReady, items, achievements]);
    const inputs = useMemo(() => selectInputs(signals, hidden), [signals, hidden]);
    const inputKey = `${cc}|${[...inputs.appids].sort((a, b) => a - b).join(',')}|${inputs.names.map(n => n.key).sort().join(',')}`;
    const libraryDataReady = sourcesReady && loadedKey === inputKey;

    // 1. Store data (tags, reviews, prices) for your own games
    useEffect(() => {
        if (!sourcesReady) return undefined;
        let cancelled = false;
        setError(null);
        loadApps(inputs.appids, inputs.names, cc)
            .then(() => {
                if (cancelled) return;
                setLoadedKey(inputKey);
                bump();
            })
            .catch(err => !cancelled && setError(recoErrorCode(err)));
        return () => {
            cancelled = true;
        };
    }, [sourcesReady, inputKey]); // eslint-disable-line react-hooks/exhaustive-deps -- inputKey identifies inputs + cc

    const apps = useMemo(() => appsFor(cc), [cc, version]); // eslint-disable-line react-hooks/exhaustive-deps -- version = cache changed
    const keyToAppid = useMemo(
        () => new Map([...nameCache].filter(([, appid]) => appid)),
        [version], // eslint-disable-line react-hooks/exhaustive-deps -- version = cache changed
    );

    // 2. Candidates for the strongest tags of your library
    const seeds = useMemo(() => {
        if (!libraryDataReady) return [];
        const own = new Map();
        for (const appid of [...inputs.appids, ...inputs.names.map(n => keyToAppid.get(n.key))]) {
            if (apps.has(appid)) own.set(appid, apps.get(appid));
        }
        return seedTags(signals, own, keyToAppid);
    }, [libraryDataReady, inputs, signals, apps, keyToAppid]);
    const candidateKey = seeds.length ? `${cc}:${seeds.join(',')}` : null;

    useEffect(() => {
        if (!candidateKey || candidateCache.has(candidateKey)) return undefined;
        let cancelled = false;
        setCandidatesLoading(true);
        fetchRecoCandidates(seeds, cc)
            .then(data => {
                const ids = [];
                for (const app of data?.apps || []) {
                    appCache.set(`${cc}:${app.appid}`, app);
                    ids.push(app.appid);
                }
                candidateCache.set(candidateKey, ids);
                bump();
            })
            .catch(err => !cancelled && setError(recoErrorCode(err)))
            .finally(() => !cancelled && setCandidatesLoading(false));
        return () => {
            cancelled = true;
        };
    }, [candidateKey]); // eslint-disable-line react-hooks/exhaustive-deps -- candidateKey identifies seeds + cc

    const candidateIds = candidateKey && candidateCache.has(candidateKey) ? candidateCache.get(candidateKey) : null;
    if (candidateIds) lastCandidates.current = candidateIds;
    const candidates = useMemo(() => new Set(candidateIds || lastCandidates.current), [candidateIds]);

    // 3. The linked Steam wishlist (optional: needs a linked, public profile)
    const wishlistKey = uid && steamId ? `${uid}:${steamId}:${cc}` : null;
    useEffect(() => {
        if (!wishlistKey || !sourcesReady) return undefined;
        let cancelled = false;
        fetchWishlist(user, cc)
            .then(async data => {
                const appids = (data?.items || []).map(i => Number(i.appid)).filter(Boolean).slice(0, 500);
                await loadApps(appids, [], cc);
                if (cancelled) return;
                setWishlist({ key: wishlistKey, appids });
                bump();
            })
            .catch(() => !cancelled && setWishlist({ key: wishlistKey, appids: [] }));
        return () => {
            cancelled = true;
        };
    }, [wishlistKey, sourcesReady]); // eslint-disable-line react-hooks/exhaustive-deps -- wishlistKey covers user + cc
    const wishlistIds = wishlist.key === wishlistKey ? wishlist.appids : NO_APPIDS;

    const result = useMemo(() => {
        if (!libraryDataReady) return null;
        return recommend({ items, achievements, apps, keyToAppid, candidates, wishlist: wishlistIds, hidden });
    }, [libraryDataReady, items, achievements, apps, keyToAppid, candidates, wishlistIds, hidden]);

    // 4. Home page teaser: users/{uid}.forYou, refreshed at most every 6 hours
    useEffect(() => {
        if (teaserSaved.current || !uid || !candidateIds || !result || result.picks.length < 4) return;
        const picks = teaserSnapshot(result);
        const previous = profile?.forYou;
        const updatedAt = previous?.updatedAt?.toMillis?.() ?? (previous?.updatedAt instanceof Date ? previous.updatedAt.getTime() : 0);
        const same = previous?.picks?.map(p => p.appid).join(',') === picks.map(p => p.appid).join(',');
        teaserSaved.current = true;
        if (same && Date.now() - updatedAt < TEASER_MAX_AGE_MS) return;
        saveTeaser(uid, picks)
            .then(() => setProfile?.(current => (current ? { ...current, forYou: { picks, updatedAt: new Date() } } : current)))
            .catch(err => console.error('Could not save recommendations teaser:', err));
    }, [uid, candidateIds, result, profile?.forYou, setProfile]);

    const hide = useCallback(card => hideRecommendation(uid, card), [uid]);
    const unhideAll = useCallback(() => clearHiddenRecommendations(uid), [uid]);
    const addToWishlist = useCallback(
        card => setStatus({ gameKey: `steam-${card.appid}`, name: card.name, image: card.image }, 'wishlist'),
        [setStatus],
    );

    let status = 'loading';
    if (error && !result) status = 'error';
    else if (result) status = result.taste.ready ? 'ready' : 'empty';

    return {
        status,
        error,
        result,
        candidatesLoading: Boolean(result?.taste.ready) && !error && (candidatesLoading || !candidateIds),
        hiddenCount: hidden.length,
        libraryCount: items.length,
        hide,
        unhideAll,
        addToWishlist,
    };
}

export function useRecoTagNames(lang) {
    const [state, setState] = useState(() => ({ lang, tags: tagCache.get(lang) || null }));
    useEffect(() => {
        if (tagCache.has(lang)) return undefined;
        let cancelled = false;
        fetchRecoTags(lang)
            .then(data => {
                tagCache.set(lang, data?.tags || {});
                if (!cancelled) setState({ lang, tags: data?.tags || {} });
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [lang]);
    return (state.lang === lang ? state.tags : null) || tagCache.get(lang) || {};
}
