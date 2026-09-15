import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsAwardFill, BsFire, BsLightningChargeFill, BsTrophy, BsTrophyFill } from 'react-icons/bs';
import { EmptyState, PageShell, Tabs } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { levelInfoOf, loadTopUsers, profileHref } from '../social/profiles.js';
import ProfileAvatar from '../social/ProfileAvatar.jsx';
import TierBadge from '../social/TierBadge.jsx';

const TOP = 50;

const BOARDS = {
    xp: { field: 'xp', icon: BsLightningChargeFill, color: '#c4b5fd', value: p => levelInfoOf(p).xp },
    streak: { field: 'bestStreak', icon: BsFire, color: '#fb923c', value: p => Number(p.bestStreak) || 0 },
    completed: { field: 'xp', icon: BsTrophyFill, color: '#fbbf24', value: p => Number(p.libraryStats?.completed) || 0 },
};

const PODIUM = [
    { place: 2, height: 'h-16 sm:h-20', color: '#cbd5e1' },
    { place: 1, height: 'h-24 sm:h-28', color: '#facc15' },
    { place: 3, height: 'h-12 sm:h-14', color: '#f59e0b' },
];

function Skeleton() {
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-6">
                {PODIUM.map(p => (
                    <div key={p.place} className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/[0.06]" />
                        <div className={`w-full rounded-t-xl bg-white/[0.04] ${p.height}`} />
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.04]" />)}
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const { user, profile: myProfile } = useContext(UserContext) || {};
    const { t, locale } = useT();
    const [board, setBoard] = useState('xp');
    const [data, setData] = useState({}); // field -> users | 'error'
    const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const cfg = BOARDS[board];

    useEffect(() => {
        let alive = true;
        loadTopUsers(cfg.field)
            .then(list => alive && setData(d => ({ ...d, [cfg.field]: list })))
            .catch(error => {
                console.error('Leaderboard failed:', error);
                if (alive) setData(d => ({ ...d, [cfg.field]: 'error' }));
            });
        return () => { alive = false; };
    }, [cfg.field]);

    const source = data[cfg.field];
    const ranked = useMemo(() => {
        if (!Array.isArray(source)) return null;
        const list = source.map(p => ({ ...p, score: cfg.value(p) })).filter(p => p.score > 0);
        list.sort((a, b) => b.score - a.score);
        return list.slice(0, TOP);
    }, [source, cfg]);

    const unit = score => t(`social.leaderboard.unit.${board}`, { value: nf.format(score), count: score });
    const myIndex = ranked && user ? ranked.findIndex(p => p.uid === user.uid) : -1;
    const tabs = [
        { id: 'xp', label: t('social.leaderboard.tabs.xp') },
        { id: 'streak', label: t('social.leaderboard.tabs.streak') },
        { id: 'completed', label: t('social.leaderboard.tabs.completed') },
    ];

    let body;
    if (source === 'error') {
        body = <EmptyState icon={BsTrophy} title={t('social.leaderboard.errorTitle')} text={t('social.feed.errorText')} />;
    } else if (!ranked) {
        body = <Skeleton />;
    } else if (ranked.length === 0) {
        body = <EmptyState icon={BsTrophy} title={t('social.leaderboard.emptyTitle')} text={t('social.leaderboard.emptyText')} />;
    } else {
        const Icon = cfg.icon;
        body = (
            <>
                {/* Podium */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-6">
                    {PODIUM.map(slot => {
                        const p = ranked[slot.place - 1];
                        if (!p) return <div key={slot.place} />;
                        const me = p.uid === user?.uid;
                        return (
                            <Link key={slot.place} to={profileHref(p.username)} className="group flex flex-col items-center min-w-0 text-center">
                                <div className="relative">
                                    <ProfileAvatar profile={p} ring className={`${slot.place === 1 ? 'w-16 h-16 sm:w-24 sm:h-24 text-2xl' : 'w-14 h-14 sm:w-20 sm:h-20 text-xl'}`} />
                                    <span
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-[#0a0b0f] border-2 border-[#0a0b0f]"
                                        style={{ background: slot.color }}
                                    >
                                        {slot.place}
                                    </span>
                                </div>
                                <p className={`mt-2.5 text-xs sm:text-sm font-semibold truncate max-w-full group-hover:text-[#c4b5fd] ${me ? 'text-[#c4b5fd]' : 'text-white'}`}>{p.username}</p>
                                <p className="text-[11px] sm:text-xs text-[#a1a6b3] truncate max-w-full">{unit(p.score)}</p>
                                <div
                                    className={`mt-2 w-full rounded-t-xl border border-b-0 flex items-start justify-center pt-2 ${slot.height}`}
                                    style={{ borderColor: `${slot.color}40`, background: `linear-gradient(180deg, ${slot.color}26, transparent)` }}
                                >
                                    {slot.place === 1 ? <BsTrophyFill style={{ color: slot.color }} aria-hidden="true" /> : <Icon style={{ color: slot.color }} aria-hidden="true" />}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Your rank */}
                {user && myProfile && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/[0.08] px-4 py-3">
                        <ProfileAvatar profile={myProfile} className="w-9 h-9 text-sm" />
                        <p className="text-sm text-[#c9ccd4] min-w-0 flex-1">
                            {myProfile.isPublic === false
                                ? t('social.leaderboard.youPrivate')
                                : myIndex >= 0
                                    ? t('social.leaderboard.yourRank', { rank: myIndex + 1 })
                                    : t('social.leaderboard.notRanked', { top: TOP })}
                        </p>
                        <span className="shrink-0 text-sm font-bold text-white">{unit(cfg.value(myProfile))}</span>
                    </div>
                )}

                <ol className="space-y-1.5">
                    {ranked.map((p, index) => {
                        const me = p.uid === user?.uid;
                        return (
                            <li key={p.uid}>
                                <Link
                                    to={profileHref(p.username)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${me ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/[0.1]' : 'border-white/[0.06] bg-[#111319] hover:border-white/[0.14]'}`}
                                >
                                    <span className={`w-7 shrink-0 text-center text-sm font-extrabold ${index < 3 ? 'text-amber-300' : 'text-[#6b7080]'}`}>{index + 1}</span>
                                    <ProfileAvatar profile={p} className="w-9 h-9 text-sm" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-white truncate">{p.username}</span>
                                        <TierBadge profile={p} className="mt-0.5" />
                                    </span>
                                    <span className="shrink-0 text-right">
                                        <span className="block text-sm font-bold text-white">{nf.format(p.score)}</span>
                                        <span className="block text-[10px] uppercase tracking-wide text-[#6b7080]">{t(`social.leaderboard.short.${board}`)}</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </>
        );
    }

    return (
        <PageShell
            eyebrow={t('social.leaderboard.eyebrow')}
            title={t('social.leaderboard.title')}
            subtitle={t('social.leaderboard.subtitle')}
            actions={<Link to="/challenges" className="gh-btn gh-btn-secondary"><BsAwardFill aria-hidden="true" /> {t('social.leaderboard.challenges')}</Link>}
        >
            <div className="max-w-3xl mx-auto">
                <Tabs tabs={tabs} value={board} onChange={setBoard} className="mb-6" />
                {body}
                {board === 'completed' && Array.isArray(ranked) && (
                    <p className="text-xs text-[#6b7080] mt-4">{t('social.leaderboard.completedNote')}</p>
                )}
            </div>
        </PageShell>
    );
}
