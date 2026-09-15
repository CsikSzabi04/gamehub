import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsPeople, BsPlusLg, BsShieldCheck, BsExclamationTriangle } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useApi } from '../Components/apiCache.js';
import { hubUrl } from '../Hub/hubApi.js';
import { EmptyState, PageShell, Tabs } from '../community/ui.jsx';
import { EMPTY_FILTERS, createdMillis, hasActiveFilters, isExpired, isOpen, matchesFilters, millis, useNow } from '../lfg/constants.js';
import { fetchMyRequests, subscribeMyRequests, subscribePost, subscribePosts, subscribeRequests } from '../lfg/lfgApi.js';
import LfgCard from '../lfg/LfgCard.jsx';
import LfgFilters from '../lfg/LfgFilters.jsx';
import CreatePostModal from '../lfg/CreatePostModal.jsx';
import JoinModal from '../lfg/JoinModal.jsx';
import PostDetailModal from '../lfg/PostDetailModal.jsx';
import ReportModal from '../lfg/ReportModal.jsx';
import { CardSkeleton } from '../lfg/parts.jsx';

const toList = data => (Array.isArray(data) ? data : []);

export default function LfgPage() {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const uid = user?.uid || null;
    const [searchParams, setSearchParams] = useSearchParams();
    const gameParam = searchParams.get('game') || '';
    const detailId = searchParams.get('post');
    const now = useNow(30000);

    const { data: universes } = useApi(hubUrl('/universes'), toList);
    const covers = useMemo(() => Object.fromEntries((universes || []).map(u => [u.id, u.cover])), [universes]);

    const [posts, setPosts] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, game: gameParam }));
    const [tab, setTab] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [joinPost, setJoinPost] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [fetched, setFetched] = useState(null); // { id, post } for ?post= ids that aren't in the list
    const [myRequests, setMyRequests] = useState({}); // postId -> own request
    const [groupFailed, setGroupFailed] = useState(false);
    const [pendingCounts, setPendingCounts] = useState({}); // own postId -> pending requests
    const [highlightId, setHighlightId] = useState(null);
    const checkedRef = useRef(new Set());
    const createdRef = useRef(null);

    // Live list of all unexpired posts
    useEffect(() => subscribePosts(list => {
        setPosts(list);
        setLoadError(false);
    }, error => {
        console.error('LFG posts failed:', error);
        setLoadError(true);
        setPosts(prev => prev || []);
    }), []);

    // ?game= from links (game pages, universes) drives the game filter
    useEffect(() => {
        setFilters(prev => (prev.game === gameParam ? prev : { ...prev, game: gameParam }));
    }, [gameParam]);

    const changeFilters = next => {
        setFilters(next);
        if (next.game !== gameParam) {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                if (next.game) params.set('game', next.game);
                else params.delete('game');
                return params;
            }, { replace: true });
        }
    };

    const openPost = useCallback(post => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('post', post.id || post);
            return params;
        });
    }, [setSearchParams]);

    const closeDetail = useCallback(() => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.delete('post');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    // ---- the post from ?post= --------------------------------------------------------------
    const listedPost = detailId && posts ? posts.find(p => p.id === detailId) : undefined;
    const needsFetch = Boolean(detailId && posts && !listedPost);

    useEffect(() => {
        if (!needsFetch) return undefined;
        return subscribePost(detailId, post => setFetched({ id: detailId, post: post || false }), () => setFetched({ id: detailId, post: false }));
    }, [needsFetch, detailId]);

    let detailPost = null;
    if (listedPost) detailPost = listedPost;
    else if (fetched?.id === detailId) detailPost = fetched.post;

    // Scroll to and highlight the linked card once
    const listedExists = Boolean(listedPost);
    useEffect(() => {
        if (!detailId || !listedExists) return undefined;
        setHighlightId(detailId);
        const frame = requestAnimationFrame(() => {
            document.getElementById(`lfg-${detailId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
        const timer = setTimeout(() => setHighlightId(null), 5000);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
        };
    }, [detailId, listedExists]);

    // ---- own requests (collection group; falls back to per-post reads without the index) ----
    useEffect(() => {
        setMyRequests({});
        setGroupFailed(false);
        checkedRef.current = new Set();
        if (!uid) return undefined;
        return subscribeMyRequests(uid, list => {
            setMyRequests(Object.fromEntries(list.map(r => [r.postId, r])));
        }, error => {
            console.warn('LFG: collection-group query on requests unavailable, using per-post reads.', error?.code || error);
            setGroupFailed(true);
        });
    }, [uid]);

    const otherPostIds = useMemo(
        () => (posts && uid ? posts.filter(p => p.uid !== uid).map(p => p.id).join(',') : ''),
        [posts, uid],
    );

    useEffect(() => {
        if (!groupFailed || !uid || !otherPostIds) return;
        const ids = otherPostIds.split(',').filter(id => !checkedRef.current.has(id));
        if (!ids.length) return;
        ids.forEach(id => checkedRef.current.add(id));
        fetchMyRequests(uid, ids)
            .then(results => setMyRequests(prev => {
                const next = { ...prev };
                for (const [id, request] of Object.entries(results)) {
                    if (request) next[id] = request;
                    else if (next[id]?.status !== 'pending') delete next[id];
                }
                return next;
            }))
            .catch(() => {});
    }, [groupFailed, uid, otherPostIds]);

    const updateMyRequest = useCallback((postId, request) => {
        setMyRequests(prev => {
            if (!request && !prev[postId]) return prev;
            const next = { ...prev };
            if (request) next[postId] = request;
            else delete next[postId];
            return next;
        });
    }, []);

    // ---- pending request counts on own posts ------------------------------------------------
    const ownPosts = useMemo(() => (posts && uid ? posts.filter(p => p.uid === uid) : []), [posts, uid]);
    const ownIds = ownPosts.map(p => p.id).join(',');

    useEffect(() => {
        if (!ownIds) return undefined;
        const unsubscribers = ownIds.split(',').map(id => subscribeRequests(
            id,
            list => setPendingCounts(prev => ({ ...prev, [id]: list.filter(r => r.status === 'pending').length })),
            () => {},
        ));
        return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    }, [ownIds]);

    // ---- visible list -----------------------------------------------------------------------
    const visible = useMemo(() => {
        if (!posts) return null;
        if (tab === 'mine') {
            return ownPosts.slice().sort((a, b) => createdMillis(b) - createdMillis(a));
        }
        if (tab === 'requests') {
            return posts
                .filter(p => myRequests[p.id])
                .sort((a, b) => (millis(myRequests[b.id].updatedAt) || Date.now()) - (millis(myRequests[a.id].updatedAt) || Date.now()));
        }
        return posts
            .filter(p => (p.uid === uid || !p.closed) && !isExpired(p, now) && matchesFilters(p, filters))
            .sort((a, b) => Number(isOpen(b, now)) - Number(isOpen(a, now)) || createdMillis(b) - createdMillis(a));
    }, [posts, tab, ownPosts, myRequests, uid, now, filters]);

    const requestCount = posts ? posts.filter(p => myRequests[p.id]).length : 0;
    const pendingTotal = ownPosts.reduce((sum, p) => sum + (pendingCounts[p.id] || 0), 0);

    const tabs = [
        { id: 'all', label: t('lfg.tabs.all') },
        ...(uid ? [
            { id: 'mine', label: t('lfg.tabs.mine'), count: pendingTotal ? `${ownPosts.length} · ${t('lfg.tabs.pending', { count: pendingTotal })}` : ownPosts.length },
            { id: 'requests', label: t('lfg.tabs.requests'), count: requestCount },
        ] : []),
    ];

    const openCreate = () => setCreateOpen(true);
    const closeCreate = () => {
        setCreateOpen(false);
        if (createdRef.current) {
            const id = createdRef.current;
            createdRef.current = null;
            setTab('all');
            openPost(id);
        }
    };

    const startJoin = post => {
        if (detailId) closeDetail();
        setJoinPost(post);
    };

    const createButton = (
        <button type="button" onClick={openCreate} className="gh-btn gh-btn-primary">
            <BsPlusLg aria-hidden="true" />
            {t('lfg.create.button')}
        </button>
    );

    const filtersActive = hasActiveFilters(filters);

    let content;
    if (!visible) {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    } else if (loadError && posts.length === 0) {
        content = <EmptyState icon={BsExclamationTriangle} title={t('lfg.errors.loadTitle')} text={t('lfg.errors.load')} />;
    } else if (visible.length === 0) {
        if (tab === 'requests') {
            content = <EmptyState icon={BsPeople} title={t('lfg.empty.requestsTitle')} text={t('lfg.empty.requestsText')} action={<button type="button" onClick={() => setTab('all')} className="gh-btn gh-btn-secondary">{t('lfg.empty.browse')}</button>} />;
        } else if (tab === 'mine') {
            content = <EmptyState icon={BsPeople} title={t('lfg.empty.mineTitle')} text={t('lfg.empty.mineText')} action={createButton} />;
        } else if (filtersActive) {
            content = (
                <EmptyState
                    icon={BsPeople}
                    title={t('lfg.empty.filteredTitle')}
                    text={t('lfg.empty.filteredText')}
                    action={(
                        <div className="flex flex-wrap justify-center gap-2">
                            <button type="button" onClick={() => changeFilters(EMPTY_FILTERS)} className="gh-btn gh-btn-secondary">{t('lfg.filters.reset')}</button>
                            {createButton}
                        </div>
                    )}
                />
            );
        } else {
            content = <EmptyState icon={BsPeople} title={t('lfg.empty.title')} text={t('lfg.empty.text')} action={createButton} />;
        }
    } else {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {visible.map(post => (
                    <LfgCard
                        key={post.id}
                        post={post}
                        cover={covers[post.game]}
                        now={now}
                        isOwner={post.uid === uid}
                        myRequest={myRequests[post.id]}
                        pendingCount={pendingCounts[post.id] || 0}
                        highlighted={highlightId === post.id}
                        onOpen={openPost}
                        onJoin={startJoin}
                    />
                ))}
            </div>
        );
    }

    return (
        <PageShell eyebrow={t('lfg.eyebrow')} title={t('lfg.title')} subtitle={t('lfg.subtitle')} actions={createButton}>
            <div className="space-y-4">
                {uid && <Tabs tabs={tabs} value={tab} onChange={setTab} />}
                {tab === 'all' && (
                    <LfgFilters
                        universes={universes}
                        filters={filters}
                        onChange={changeFilters}
                        onReset={filtersActive ? () => changeFilters(EMPTY_FILTERS) : null}
                    />
                )}
                <p className="flex items-start gap-2 text-xs text-[#6b7080]">
                    <BsShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400/80 mt-px" aria-hidden="true" />
                    <span>{t('lfg.safety.short')}</span>
                </p>
                {content}
            </div>

            <CreatePostModal
                open={createOpen}
                onClose={closeCreate}
                universes={universes}
                initialGame={filters.game}
                loadedOwnPosts={ownPosts}
                onCreated={id => { createdRef.current = id; }}
            />
            <PostDetailModal
                open={Boolean(detailId)}
                post={detailPost}
                cover={detailPost ? covers[detailPost.game] : null}
                now={now}
                onClose={closeDetail}
                onJoin={startJoin}
                onReport={setReportTarget}
                onDeleted={closeDetail}
                onRequestChange={updateMyRequest}
            />
            <JoinModal post={joinPost} onClose={() => setJoinPost(null)} onSent={postId => updateMyRequest(postId, { status: 'pending', postId, uid })} />
            <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
        </PageShell>
    );
}
