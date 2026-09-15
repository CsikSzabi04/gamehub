import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowClockwise, BsAwardFill, BsCalendar3, BsInfoCircle, BsTrophyFill } from 'react-icons/bs';
import { PageShell } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import {
    challengesForMonth, claimChallengeBadge, daysLeftInMonth, isClaimed, loadChallengeContext, monthKeyOf, monthRange,
} from '../challenges/challenges.js';
import ChallengeCard from '../challenges/ChallengeCard.jsx';
import ChallengeBadge from '../challenges/ChallengeBadge.jsx';

export default function ChallengesPage() {
    const { user, profile, setProfile, authReady } = useContext(UserContext) || {};
    const { t, locale } = useT();
    const monthKey = monthKeyOf();
    const challenges = useMemo(() => challengesForMonth(monthKey), [monthKey]);
    const [ctx, setCtx] = useState(null);
    const [loadingCtx, setLoadingCtx] = useState(false);
    const [claiming, setClaiming] = useState(null);
    const [claimError, setClaimError] = useState(false);
    const [reload, setReload] = useState(0);
    const uid = user?.uid;
    const hasProfile = Boolean(profile);

    // The context reads the profile only for the current streak; avoid reloading on every profile change
    const streakKey = `${profile?.lastActiveDate || ''}:${profile?.streak || 0}`;

    useEffect(() => {
        if (!uid || !hasProfile) return undefined;
        let alive = true;
        setLoadingCtx(true);
        loadChallengeContext(user, profile, monthKey)
            .then(result => alive && setCtx(result))
            .catch(error => {
                console.error('Challenge progress failed:', error);
                if (alive) setCtx({ failed: true });
            })
            .finally(() => alive && setLoadingCtx(false));
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid, hasProfile, monthKey, streakKey, reload]);

    const claim = useCallback(async challenge => {
        if (!user || !profile) return;
        setClaiming(challenge.id);
        setClaimError(false);
        try {
            const next = await claimChallengeBadge(user, profile, challenge, monthKey);
            setProfile?.(prev => ({ ...prev, challengeBadges: next }));
        } catch (error) {
            console.error('Claim failed:', error);
            setClaimError(true);
        } finally {
            setClaiming(null);
        }
    }, [user, profile, setProfile, monthKey]);

    const monthName = monthRange(monthKey).start.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const daysLeft = daysLeftInMonth();
    const signedIn = Boolean(uid);
    const progressOf = c => (signedIn && ctx && !ctx.failed ? c.measure(ctx) : null);
    const claimedCount = signedIn ? challenges.filter(c => isClaimed(profile, c.id, monthKey)).length : 0;
    const badges = useMemo(
        () => [...(profile?.challengeBadges || [])].sort((a, b) => (b.earnedAt || 0) - (a.earnedAt || 0)),
        [profile?.challengeBadges],
    );

    return (
        <PageShell
            eyebrow={t('challenges.eyebrow')}
            title={t('challenges.title')}
            subtitle={t('challenges.subtitle')}
            actions={<Link to="/leaderboard" className="gh-btn gh-btn-secondary"><BsTrophyFill aria-hidden="true" /> {t('challenges.leaderboard')}</Link>}
        >
            {/* Month header */}
            <div className="gh-surface p-4 sm:p-5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-[#8b5cf6]/15 text-[#c4b5fd]">
                        <BsCalendar3 aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-base font-bold text-white capitalize truncate">{monthName}</p>
                        <p className="text-xs text-[#a1a6b3]">{t('challenges.daysLeft', { count: daysLeft })}</p>
                    </div>
                </div>
                {signedIn && (
                    <div className="text-sm text-[#c9ccd4]">
                        {t('challenges.claimedCount', { claimed: claimedCount, total: challenges.length })}
                    </div>
                )}
                {signedIn && (
                    <button
                        type="button"
                        onClick={() => setReload(n => n + 1)}
                        disabled={loadingCtx}
                        className="gh-btn gh-btn-secondary !h-9 sm:ml-auto"
                    >
                        <BsArrowClockwise aria-hidden="true" className={loadingCtx ? 'animate-spin' : ''} /> {t('challenges.refresh')}
                    </button>
                )}
            </div>

            {authReady && !signedIn && (
                <div className="gh-surface p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-3 border-[#8b5cf6]/30">
                    <p className="text-sm text-[#c9ccd4] flex-1">{t('challenges.loginText')}</p>
                    <Link to="/login" className="gh-btn gh-btn-primary">{t('challenges.login')}</Link>
                </div>
            )}

            {claimError && <p className="mb-4 text-sm text-red-400" role="alert">{t('challenges.claimError')}</p>}

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {challenges.map(c => (
                    (signedIn && !ctx) || (!authReady && !signedIn) ? (
                        <div key={c.id} className="gh-surface h-48 animate-pulse" />
                    ) : (
                        <ChallengeCard
                            key={c.id}
                            challenge={c}
                            progress={progressOf(c)}
                            claimed={signedIn && isClaimed(profile, c.id, monthKey)}
                            claiming={claiming === c.id}
                            onClaim={signedIn ? () => claim(c) : undefined}
                        />
                    )
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-8">
                <section className="lg:col-span-2 gh-surface p-4 sm:p-5 min-w-0">
                    <h2 className="flex items-center gap-2 text-base font-bold text-white mb-3">
                        <BsAwardFill className="text-amber-300" aria-hidden="true" /> {t('challenges.badgesTitle')}
                    </h2>
                    {!signedIn ? (
                        <p className="text-sm text-[#6b7080]">{t('challenges.badgesLoggedOut')}</p>
                    ) : badges.length === 0 ? (
                        <p className="text-sm text-[#6b7080]">{t('challenges.badgesEmpty')}</p>
                    ) : (
                        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
                            {badges.map(b => <ChallengeBadge key={`${b.id}-${b.month}`} badge={b} />)}
                        </div>
                    )}
                </section>

                <section className="gh-surface p-4 sm:p-5 min-w-0">
                    <h2 className="flex items-center gap-2 text-base font-bold text-white mb-3">
                        <BsInfoCircle className="text-[#c4b5fd]" aria-hidden="true" /> {t('challenges.howTitle')}
                    </h2>
                    <ul className="space-y-2 text-sm text-[#a1a6b3] list-disc pl-5">
                        <li>{t('challenges.how1')}</li>
                        <li>{t('challenges.how2')}</li>
                        <li>{t('challenges.how3')}</li>
                    </ul>
                    <Link to="/leaderboard" className="inline-block mt-4 text-sm font-medium text-[#c4b5fd] hover:text-white">
                        {t('challenges.leaderboardLink')} →
                    </Link>
                </section>
            </div>
        </PageShell>
    );
}
