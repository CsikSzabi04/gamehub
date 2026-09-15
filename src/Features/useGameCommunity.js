import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from './UserContext.jsx';
import { API_BASE } from '../Components/apiCache.js';
import { reviewRequest } from '../reviews/reviewApi.js';
import { postActivity } from '../social/activity.js';
import { useT } from '../i18n/index.jsx';
import {
    MIN_REVIEW_LENGTH,
    PAGE_SIZE,
    SORTS,
    draftFromReview,
    draftToBody,
    emptyDraft,
    sortReviews,
    summarizeReviews,
} from '../reviews/reviewUtils.js';

const apiGet = (path, user) => reviewRequest('GET', path, { user });
const apiPost = (path, body, user) => reviewRequest('POST', path, { body, user });
const apiDelete = (path, body, user) => reviewRequest('DELETE', path, { body, user });

const errorKeyOf = error => (error?.status === 503 ? 'unavailable' : 'actionFailed');

/**
 * GameDataHub reviews + favorites for one game.
 * gameId can be a RAWG id (12020) or a store key ("steam-730", "gog-1207658924").
 *
 * Reviews come from GET /reviews?gameId= (sorted, paged, with summary). Against an older backend
 * without that route (or when it fails) it falls back to filtering /get-all-reviews on the client.
 */
export default function useGameCommunity(gameId, gameName) {
    const { user, profile } = useContext(UserContext) || {};
    const { t } = useT();

    const [items, setItems] = useState([]);
    const [serverSummary, setServerSummary] = useState(null);
    const [legacyList, setLegacyList] = useState(null); // all reviews of the game when /reviews is missing
    const [legacyShown, setLegacyShown] = useState(PAGE_SIZE);
    const [sort, setSortState] = useState('helpful');
    const [nextCursor, setNextCursor] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reviewsVersion, setReviewsVersion] = useState(0);
    const [loadErrorKey, setLoadErrorKey] = useState('');

    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [draft, setDraft] = useState(emptyDraft);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [reviewErrorKey, setReviewErrorKey] = useState('');
    const [actionErrorKey, setActionErrorKey] = useState('');
    const [myVotes, setMyVotes] = useState([]);

    const [favorites, setFavorites] = useState([]);
    const [favErrorKey, setFavErrorKey] = useState('');

    const requestRef = useRef(0);
    const gameParam = gameId != null ? encodeURIComponent(String(gameId)) : '';

    // ━━━━━━━━━━━━━━━━ reviews ━━━━━━━━━━━━━━━━

    useEffect(() => {
        if (!gameParam) return undefined;
        let cancelled = false;
        const request = ++requestRef.current; // also lets loadMore() drop pages of an older list
        const current = () => !cancelled && request === requestRef.current;
        setLoadingReviews(true);

        (async () => {
            try {
                const data = await apiGet(`/reviews?gameId=${gameParam}&sort=${sort}&limit=${PAGE_SIZE}`);
                if (!current()) return;
                setLegacyList(null);
                setItems(Array.isArray(data?.items) ? data.items : []);
                setServerSummary(data?.summary || null);
                setNextCursor(data?.nextCursor || null);
                setLoadErrorKey('');
            } catch {
                // Older backend without /reviews (404), or the route failing: filter the full list instead
                try {
                    const res = await fetch(`${API_BASE}/get-all-reviews`);
                    const all = await res.json();
                    if (!current()) return;
                    const key = decodeURIComponent(gameParam);
                    setLegacyList(Array.isArray(all) ? all.filter(r => String(r.gameId) === key) : []);
                    setNextCursor(null);
                    setLoadErrorKey('');
                } catch {
                    if (current()) setLoadErrorKey('loadFailed');
                }
            } finally {
                if (current()) setLoadingReviews(false);
            }
        })();

        return () => { cancelled = true; };
    }, [gameParam, sort, reviewsVersion]);

    useEffect(() => {
        if (!user || !gameParam) {
            setMyVotes([]);
            return undefined;
        }
        let active = true;
        apiGet(`/reviews/mine/votes?gameId=${gameParam}`, user)
            .then(data => { if (active) setMyVotes(Array.isArray(data?.ids) ? data.ids.map(String) : []); })
            .catch(() => { if (active) setMyVotes([]); });
        return () => { active = false; };
    }, [user, gameParam, reviewsVersion]);

    const legacySorted = useMemo(() => (legacyList ? sortReviews(legacyList, sort) : null), [legacyList, sort]);
    const reviews = legacySorted ? legacySorted.slice(0, legacyShown) : items;
    const summary = useMemo(
        () => (legacyList ? summarizeReviews(legacyList) : serverSummary),
        [legacyList, serverSummary],
    );
    const hasMore = legacySorted ? legacyShown < legacySorted.length : Boolean(nextCursor);
    const myReview = user ? (legacySorted || items).find(r => r.userId === user.uid) || null : null;

    function setSort(value) {
        if (!SORTS.includes(value) || value === sort) return;
        setLegacyShown(PAGE_SIZE);
        setSortState(value);
    }

    async function loadMore() {
        if (legacySorted) {
            setLegacyShown(n => n + PAGE_SIZE);
            return;
        }
        if (!nextCursor || loadingMore) return;
        const request = requestRef.current;
        setLoadingMore(true);
        try {
            const data = await apiGet(`/reviews?gameId=${gameParam}&sort=${sort}&limit=${PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`);
            if (request !== requestRef.current) return;
            setItems(prev => {
                const seen = new Set(prev.map(r => String(r.id)));
                return [...prev, ...(data?.items || []).filter(r => !seen.has(String(r.id)))];
            });
            setNextCursor(data?.nextCursor || null);
        } catch (error) {
            setActionErrorKey(errorKeyOf(error));
        } finally {
            setLoadingMore(false);
        }
    }

    function updateItem(id, patch) {
        setItems(prev => prev.map(r => (String(r.id) === String(id) ? { ...r, ...patch } : r)));
    }

    /** Toggles "helpful" on a review. Returns { voted, helpfulCount } or null. */
    async function vote(id) {
        const key = String(id);
        if (!user) {
            setActionErrorKey('voteLogin');
            return null;
        }
        const target = items.find(r => String(r.id) === key);
        const had = myVotes.includes(key);
        const previousCount = target?.helpfulCount || 0;
        setActionErrorKey('');
        setMyVotes(prev => (had ? prev.filter(v => v !== key) : [...prev, key]));
        updateItem(key, { helpfulCount: Math.max(previousCount + (had ? -1 : 1), 0) });
        try {
            const result = await apiPost(`/reviews/${encodeURIComponent(key)}/vote`, {}, user);
            setMyVotes(prev => {
                const rest = prev.filter(v => v !== key);
                return result?.voted ? [...rest, key] : rest;
            });
            updateItem(key, { helpfulCount: result?.helpfulCount ?? 0 });
            return result;
        } catch (error) {
            setMyVotes(prev => {
                const rest = prev.filter(v => v !== key);
                return had ? [...rest, key] : rest;
            });
            updateItem(key, { helpfulCount: previousCount });
            setActionErrorKey(errorKeyOf(error));
            return null;
        }
    }

    /** Reports a review. Returns { ok, alreadyReported } or { ok:false, error }. */
    async function report(id, reason) {
        if (!user) return { ok: false, error: t('reviewsPlus.errors.voteLogin') };
        try {
            const result = await apiPost(`/reviews/${encodeURIComponent(String(id))}/report`, { reason }, user);
            if (result?.hidden) setItems(prev => prev.filter(r => String(r.id) !== String(id)));
            return { ok: true, alreadyReported: Boolean(result?.alreadyReported) };
        } catch (error) {
            return { ok: false, error: t(`reviewsPlus.errors.${errorKeyOf(error)}`) };
        }
    }

    /** Deletes the user's own review. Returns true on success. */
    async function remove(id) {
        if (!user) return false;
        setActionErrorKey('');
        try {
            await apiDelete(`/reviews/${encodeURIComponent(String(id))}`, undefined, user);
            setItems(prev => prev.filter(r => String(r.id) !== String(id)));
            if (String(editingId) === String(id)) cancelEdit();
            setReviewsVersion(v => v + 1);
            return true;
        } catch (error) {
            setActionErrorKey(errorKeyOf(error));
            return false;
        }
    }

    function startEdit(review) {
        if (!review) return;
        setEditingId(review.id);
        setNewReview(review.review || '');
        setRating(Number(review.rating) || 0);
        setDraft(draftFromReview(review));
        setReviewErrorKey('');
    }

    function cancelEdit() {
        setEditingId(null);
        setNewReview('');
        setRating(0);
        setDraft(emptyDraft());
        setReviewErrorKey('');
    }

    /** options.minLength: enforced by the full review form (the simple form only needs some text). */
    async function submitReview(options) {
        const minLength = typeof options?.minLength === 'number' ? options.minLength : 1;
        const text = newReview.trim();
        if (!text || rating === 0) {
            setReviewErrorKey('validation');
            return false;
        }
        if (text.length < minLength) {
            setReviewErrorKey('tooShort');
            return false;
        }
        if (submitting) return false;
        setSubmitting(true);
        const postedRating = rating;
        try {
            // No e-mail is sent: the backend shows the username instead
            const result = await apiPost('/submit-review', {
                gameId,
                userId: user ? user.uid : 'anonymous',
                reviewText: text,
                rating: postedRating,
                gameName,
                ...draftToBody(draft),
            }, user);
            setReviewErrorKey('');
            setNewReview('');
            setRating(0);
            setDraft(emptyDraft());
            setEditingId(null);
            setReviewsVersion(v => v + 1);
            if (user && !result?.updated) {
                postActivity(user, profile, { type: 'review', gameKey: String(gameId), gameName: gameName || null, text: `${postedRating}/5` });
            }
            return true;
        } catch (err) {
            console.error('Error submitting review:', err);
            setReviewErrorKey('submitFailed');
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    // ━━━━━━━━━━━━━━━━ favorites ━━━━━━━━━━━━━━━━

    useEffect(() => {
        if (!user?.uid) {
            setFavorites([]);
            return;
        }
        let active = true;
        fetch(`${API_BASE}/getFav?userId=${encodeURIComponent(user.uid)}`)
            .then(res => res.json())
            .then(data => { if (active) setFavorites(Array.isArray(data) ? data : []); })
            .catch(err => console.error('Failed to fetch favorites:', err));
        return () => { active = false; };
    }, [user?.uid]);

    const isFavorite = favorites.some(f => String(f.gameId) === String(gameId));

    async function addFavorite() {
        if (!user) {
            setFavErrorKey('favLogin');
            return;
        }
        setFavErrorKey('');
        try {
            await apiPost('/addfav', { name: gameName, gameId, userId: user.uid }, user);
            setFavorites(prev => (prev.some(f => String(f.gameId) === String(gameId)) ? prev : [...prev, { gameId, name: gameName }]));
        } catch {
            setFavErrorKey('favAddFailed');
        }
    }

    async function removeFavorite() {
        if (!user) return;
        setFavErrorKey('');
        try {
            await apiDelete(`/delfav/${encodeURIComponent(gameId)}`, { userId: user.uid }, user);
            setFavorites(prev => prev.filter(f => String(f.gameId) !== String(gameId)));
        } catch {
            setFavErrorKey('favRemoveFailed');
        }
    }

    const tr = key => (key ? t(`reviewsPlus.errors.${key}`, { min: MIN_REVIEW_LENGTH }) : '');

    return {
        user,
        profile,
        gameId,
        gameName,
        // reviews
        reviews,
        summary,
        sort,
        setSort,
        hasMore,
        loadMore,
        loadingReviews,
        loadingMore,
        loadError: tr(loadErrorKey),
        legacyBackend: Boolean(legacyList), // backend without the /reviews API: no votes/reports/delete
        vote,
        report,
        remove,
        myVotes,
        myReview,
        actionError: tr(actionErrorKey),
        // write form
        newReview,
        setNewReview,
        rating,
        setRating,
        draft,
        setDraft,
        editingId,
        startEdit,
        cancelEdit,
        submitting,
        submitReview,
        reviewError: tr(reviewErrorKey),
        // favorites
        isFavorite,
        addFavorite,
        removeFavorite,
        favError: tr(favErrorKey),
    };
}
