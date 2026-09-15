import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowClockwise, BsAwardFill, BsPeople, BsRssFill } from 'react-icons/bs';
import { EmptyState, PageShell, Tabs } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { fetchProfiles, isPublicProfile, loadActivityFor, loadRecentActivity } from '../social/profiles.js';
import { fetchFollowingUids } from '../social/useFollow.js';
import ActivityItem from '../social/ActivityItem.jsx';
import WhoToFollow from '../social/WhoToFollow.jsx';

function FeedSkeleton() {
    return (
        <div className="space-y-2.5">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#111319] border border-white/[0.06] animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3.5 w-3/4 rounded bg-white/[0.06]" />
                        <div className="h-3 w-1/4 rounded bg-white/[0.04]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FeedPage() {
    const { user, authReady } = useContext(UserContext) || {};
    const { t } = useT();
    const [tab, setTab] = useState(null);
    const [state, setState] = useState({ key: null, items: null, profiles: new Map(), followsNobody: false, error: false });
    const [reloadToken, setReloadToken] = useState(0);
    const uid = user?.uid;
    const activeTab = tab || (uid ? 'following' : 'everyone');
    const loadKey = `${activeTab}:${uid || ''}:${reloadToken}`;

    useEffect(() => {
        if (!authReady) return undefined;
        if (activeTab === 'following' && !uid) return undefined;
        let alive = true;

        (async () => {
            try {
                let items;
                let followsNobody = false;
                if (activeTab === 'following') {
                    const followed = await fetchFollowingUids(uid, { fresh: reloadToken > 0 });
                    followsNobody = followed.length === 0;
                    items = followsNobody ? [] : await loadActivityFor([...followed, uid], 50);
                } else {
                    items = await loadRecentActivity(50);
                }
                const profiles = await fetchProfiles(items.map(i => i.uid));
                // Hide entries of profiles that went private (or can't be read any more)
                items = items.filter(i => i.uid === uid || (profiles.has(i.uid) && isPublicProfile(profiles.get(i.uid))));
                if (alive) setState({ key: loadKey, items, profiles, followsNobody, error: false });
            } catch (error) {
                console.error('Feed failed:', error);
                if (alive) setState({ key: loadKey, items: [], profiles: new Map(), followsNobody: false, error: true });
            }
        })();
        return () => { alive = false; };
    }, [authReady, activeTab, uid, reloadToken, loadKey]);

    const loading = !authReady || (state.key !== loadKey && !(activeTab === 'following' && !uid));

    const tabs = [
        { id: 'following', label: t('social.feed.following') },
        { id: 'everyone', label: t('social.feed.everyone') },
    ];

    let content;
    if (activeTab === 'following' && authReady && !uid) {
        content = (
            <EmptyState
                icon={BsPeople}
                title={t('social.feed.loginTitle')}
                text={t('social.feed.loginText')}
                action={<Link to="/login" className="gh-btn gh-btn-primary">{t('social.login')}</Link>}
            />
        );
    } else if (loading) {
        content = <FeedSkeleton />;
    } else if (state.error) {
        content = (
            <EmptyState
                icon={BsRssFill}
                title={t('social.feed.errorTitle')}
                text={t('social.feed.errorText')}
                action={<button type="button" onClick={() => setReloadToken(n => n + 1)} className="gh-btn gh-btn-secondary">{t('social.retry')}</button>}
            />
        );
    } else if (state.items.length === 0) {
        content = activeTab === 'following' && state.followsNobody ? (
            <EmptyState
                icon={BsPeople}
                title={t('social.feed.noFollowsTitle')}
                text={t('social.feed.noFollowsText')}
                action={<button type="button" onClick={() => setTab('everyone')} className="gh-btn gh-btn-secondary">{t('social.feed.seeEveryone')}</button>}
            />
        ) : (
            <EmptyState icon={BsRssFill} title={t('social.feed.emptyTitle')} text={t('social.feed.emptyText')} />
        );
    } else {
        content = (
            <div className="space-y-2.5">
                {state.items.map(item => <ActivityItem key={item.id} item={item} profile={state.profiles.get(item.uid)} />)}
            </div>
        );
    }

    return (
        <PageShell eyebrow={t('social.feed.eyebrow')} title={t('social.feed.title')} subtitle={t('social.feed.subtitle')}>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <Tabs tabs={tabs} value={activeTab} onChange={setTab} />
                        <button
                            type="button"
                            onClick={() => setReloadToken(n => n + 1)}
                            disabled={loading}
                            className="gh-icon-btn shrink-0"
                            aria-label={t('social.refresh')}
                            title={t('social.refresh')}
                        >
                            <BsArrowClockwise aria-hidden="true" className={loading && authReady ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    {content}
                </div>
                <aside className="space-y-4 min-w-0">
                    <WhoToFollow />
                    <Link to="/challenges" className="gh-surface p-4 sm:p-5 flex items-center gap-3 hover:border-white/[0.14] transition-colors">
                        <span className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-amber-400/15 text-amber-300">
                            <BsAwardFill aria-hidden="true" className="w-5 h-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">{t('social.feed.challengesTitle')}</span>
                            <span className="block text-xs text-[#a1a6b3]">{t('social.feed.challengesText')}</span>
                        </span>
                    </Link>
                </aside>
            </div>
        </PageShell>
    );
}
