import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsArrowClockwise, BsPlusLg, BsSearch, BsShieldShaded } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { EmptyState, Modal, PageShell, RequireLogin, Tabs, inputClass } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import BuildCard from '../builds/BuildCard.jsx';
import BuildCreator from '../builds/BuildCreator.jsx';
import BuildDetail from '../builds/BuildDetail.jsx';
import { buildText, buildUrl, copyText, deleteBuild, fetchBuild, fetchBuilds, fetchLiked, toggleLike } from '../builds/buildsApi.js';

const PAGE_SIZE = 24;

export default function BuildsPage() {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [searchParams, setSearchParams] = useSearchParams();
    const [role, setRole] = useState('all');
    const [sort, setSort] = useState('top');
    const [search, setSearch] = useState('');
    const [builds, setBuilds] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [likedState, setLikedState] = useState({ uid: null, map: {} });
    const [likeBusy, setLikeBusy] = useState({});
    const [creatorOpen, setCreatorOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [extraBuild, setExtraBuild] = useState(null); // shared build that isn't in the loaded list
    const [extraLoading, setExtraLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const uid = user?.uid || null;

    // Liked flags belong to one account; switching accounts starts from scratch
    const liked = likedState.uid === uid ? likedState.map : {};
    const setLiked = updater => setLikedState(prev => {
        const base = prev.uid === uid ? prev.map : {};
        return { uid, map: typeof updater === 'function' ? updater(base) : updater };
    });

    const openId = searchParams.get('id');

    const showToast = useCallback(message => {
        setToast(message);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }, []);
    useEffect(() => () => clearTimeout(toastTimer.current), []);

    // Load builds for the chosen sort
    useEffect(() => {
        let cancelled = false;
        setLoadError(false);
        fetchBuilds(sort)
            .then(list => { if (!cancelled) setBuilds(list); })
            .catch(error => {
                console.error('Could not load builds:', error);
                if (!cancelled) {
                    setLoadError(true);
                    setBuilds(prev => prev || []);
                }
            });
        return () => { cancelled = true; };
    }, [sort, reloadKey]);

    const filtered = useMemo(() => {
        if (!builds) return [];
        const q = search.trim().toLowerCase();
        return builds.filter(b => (role === 'all' || b.role === role)
            && (!q || (b.perks || []).some(p => p.name.toLowerCase().includes(q)) || String(b.title || '').toLowerCase().includes(q)));
    }, [builds, role, search]);

    useEffect(() => setVisible(PAGE_SIZE), [role, sort, search]);

    const shown = filtered.slice(0, visible);
    const openBuild = openId ? builds?.find(b => b.id === openId) || (extraBuild?.id === openId ? extraBuild : null) : null;

    // Shared link to a build outside the loaded list
    useEffect(() => {
        if (!openId || !builds || builds.some(b => b.id === openId)) return undefined;
        let cancelled = false;
        setExtraLoading(true);
        fetchBuild(openId)
            .then(build => { if (!cancelled) setExtraBuild(build); })
            .catch(() => { if (!cancelled) setExtraBuild(null); })
            .finally(() => { if (!cancelled) setExtraLoading(false); });
        return () => { cancelled = true; };
    }, [openId, builds]);

    // Which of the visible builds the user liked
    const likedRef = useRef(liked);
    likedRef.current = liked;
    const idsKey = [...shown.map(b => b.id), openBuild?.id].filter(Boolean).join(',');
    useEffect(() => {
        if (!uid) return undefined;
        const missing = idsKey.split(',').filter(id => id && !(id in likedRef.current));
        if (!missing.length) return undefined;
        let cancelled = false;
        fetchLiked(uid, missing).then(map => {
            if (!cancelled) setLikedState(prev => ({ uid, map: { ...(prev.uid === uid ? prev.map : {}), ...map } }));
        });
        return () => { cancelled = true; };
    }, [uid, idsKey]);

    const patchBuild = (id, patch) => {
        setBuilds(prev => prev?.map(b => (b.id === id ? { ...b, ...patch } : b)));
        setExtraBuild(prev => (prev?.id === id ? { ...prev, ...patch } : prev));
    };

    async function like(build) {
        if (!uid) {
            setLoginOpen(true);
            return;
        }
        if (likeBusy[build.id]) return;
        const wasLiked = Boolean(liked[build.id]);
        const count = build.likeCount || 0;
        setLikeBusy(prev => ({ ...prev, [build.id]: true }));
        setLiked(prev => ({ ...prev, [build.id]: !wasLiked }));
        patchBuild(build.id, { likeCount: Math.max(0, count + (wasLiked ? -1 : 1)) });
        try {
            const nowLiked = await toggleLike(build.id, uid);
            if (nowLiked === wasLiked) {
                // Server state differed from what we showed: realign
                setLiked(prev => ({ ...prev, [build.id]: nowLiked }));
                patchBuild(build.id, { likeCount: Math.max(0, count + (nowLiked ? 1 : -1)) });
            }
        } catch (error) {
            console.error('Could not update like:', error);
            setLiked(prev => ({ ...prev, [build.id]: wasLiked }));
            patchBuild(build.id, { likeCount: count });
            showToast(t('builds.likeError'));
        } finally {
            setLikeBusy(prev => ({ ...prev, [build.id]: false }));
        }
    }

    async function share(build) {
        const url = buildUrl(build.id);
        if (navigator.share) {
            try {
                await navigator.share({ title: build.title, text: t('builds.shareText', { title: build.title }), url });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }
        showToast(t(await copyText(url) ? 'builds.linkCopied' : 'builds.copyFailed'));
    }

    async function copy(build) {
        const text = buildText(build, { roleLabel: t(`builds.role.${build.role}`), perksLabel: t('builds.perksLabel') });
        showToast(t(await copyText(text) ? 'builds.textCopied' : 'builds.copyFailed'));
    }

    async function remove(build) {
        try {
            await deleteBuild(build.id);
            setBuilds(prev => prev?.filter(b => b.id !== build.id));
            if (extraBuild?.id === build.id) setExtraBuild(null);
            closeDetail();
            showToast(t('builds.deleted'));
        } catch (error) {
            console.error('Could not delete build:', error);
            showToast(t('builds.deleteError'));
        }
    }

    function openDetail(build) {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('id', build.id);
            return next;
        });
    }

    function closeDetail() {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('id');
            return next;
        }, { replace: true });
    }

    function created(build) {
        setCreatorOpen(false);
        setBuilds(prev => [build, ...(prev || []).filter(b => b.id !== build.id)]);
        setLiked(prev => ({ ...prev, [build.id]: false }));
        if (role !== 'all' && role !== build.role) setRole(build.role);
        setSearch('');
        showToast(t('builds.created'));
        openDetail(build);
    }

    const actions = (
        <button type="button" onClick={() => setCreatorOpen(true)} className="gh-btn gh-btn-primary">
            <BsPlusLg className="w-4 h-4" /> {t('builds.create')}
        </button>
    );

    return (
        <PageShell eyebrow={t('builds.eyebrow')} title={t('builds.title')} subtitle={t('builds.subtitle')} actions={actions}>
            <div className="flex flex-col gap-3 mb-5">
                <Tabs
                    value={role}
                    onChange={setRole}
                    tabs={[
                        { id: 'all', label: t('builds.filters.all') },
                        { id: 'survivor', label: t('builds.role.survivor') },
                        { id: 'killer', label: t('builds.role.killer') },
                    ]}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <label className="relative flex-1">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080] text-sm" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('builds.filters.search')} aria-label={t('builds.filters.search')} className={`${inputClass} !pl-9`} />
                    </label>
                    <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('builds.filters.sort')} className={`${inputClass} sm:w-48`}>
                        <option value="top">{t('builds.filters.top')}</option>
                        <option value="new">{t('builds.filters.new')}</option>
                    </select>
                </div>
            </div>

            {loadError && (
                <div className="gh-surface p-3 mb-4 flex items-center justify-between gap-3 text-sm text-[#fca5a5]">
                    {t('builds.loadError')}
                    <button type="button" onClick={() => setReloadKey(k => k + 1)} className="gh-btn gh-btn-secondary !h-8"><BsArrowClockwise className="w-4 h-4" /> {t('builds.retry')}</button>
                </div>
            )}

            {!builds ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[260px] rounded-xl bg-[#111319] animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={BsShieldShaded}
                    title={builds.length ? t('builds.noMatches') : t('builds.empty')}
                    text={builds.length ? t('builds.noMatchesText') : t('builds.emptyText')}
                    action={<button type="button" onClick={() => setCreatorOpen(true)} className="gh-btn gh-btn-primary"><BsPlusLg className="w-4 h-4" /> {t('builds.create')}</button>}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shown.map(build => (
                            <BuildCard
                                key={build.id}
                                build={build}
                                liked={Boolean(liked[build.id])}
                                likeBusy={Boolean(likeBusy[build.id])}
                                onLike={() => like(build)}
                                onOpen={() => openDetail(build)}
                                onShare={() => share(build)}
                                onCopy={() => copy(build)}
                            />
                        ))}
                    </div>
                    {filtered.length > visible && (
                        <div className="flex justify-center mt-6">
                            <button type="button" onClick={() => setVisible(v => v + PAGE_SIZE)} className="gh-btn gh-btn-secondary">
                                {t('builds.showMore', { count: filtered.length - visible })}
                            </button>
                        </div>
                    )}
                </>
            )}

            <BuildDetail
                open={Boolean(openId)}
                build={openBuild}
                loading={!builds || extraLoading}
                onClose={closeDetail}
                liked={Boolean(openBuild && liked[openBuild.id])}
                likeBusy={Boolean(openBuild && likeBusy[openBuild.id])}
                onLike={() => openBuild && like(openBuild)}
                onShare={() => openBuild && share(openBuild)}
                onCopy={() => openBuild && copy(openBuild)}
                onDelete={remove}
            />

            <Modal open={creatorOpen} onClose={() => setCreatorOpen(false)} title={t('builds.createTitle')} subtitle={t('builds.createSubtitle')}>
                {creatorOpen && <BuildCreator onCreated={created} />}
            </Modal>

            <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title={t('builds.like')}>
                <RequireLogin message={t('builds.loginToLike')}>
                    <p className="text-sm text-[#a1a6b3]">{t('builds.loggedInNow')}</p>
                </RequireLogin>
            </Modal>

            {toast && (
                <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[300] px-4 py-2.5 rounded-xl bg-[#eceef2] text-[#0a0b0f] text-sm font-semibold shadow-[0_12px_40px_rgba(0,0,0,0.5)] max-w-[90vw] text-center">
                    {toast}
                </div>
            )}
        </PageShell>
    );
}
