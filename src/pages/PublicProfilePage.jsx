import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    BsActivity, BsAwardFill, BsBoxArrowUpRight, BsCheck2, BsController, BsFire, BsFlag, BsLightningChargeFill,
    BsLockFill, BsPencilSquare, BsPersonX, BsShare, BsStarFill, BsTrophyFill,
} from 'react-icons/bs';
import { EmptyState, Field, Modal, PageShell, inputClass } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { firestore } from '../lib/firebase.js';
import { gameHref, parseGameKey } from '../lib/games.js';
import { bannerBackground, getAccent } from '../Components/profile/profileUtils.js';
import { loadPublicBanner } from '../social/publicProfile.js';
import {
    findProfileByUsername, levelInfoOf, loadActivityFor, loadUserReviews, profileHref,
} from '../social/profiles.js';
import { useFollowCounts } from '../social/useFollow.js';
import ProfileAvatar from '../social/ProfileAvatar.jsx';
import FollowButton from '../social/FollowButton.jsx';
import TierBadge from '../social/TierBadge.jsx';
import ActivityItem from '../social/ActivityItem.jsx';
import FollowListModal from '../social/FollowListModal.jsx';
import ChallengeBadge from '../challenges/ChallengeBadge.jsx';

const LIBRARY_STAT_KEYS = ['total', 'playing', 'completed', 'backlog', 'wishlist', 'dropped'];
const REPORT_REASONS = ['spam', 'offensive', 'impersonation', 'other'];

function Section({ title, icon: Icon, action, children }) {
    return (
        <section className="gh-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                    {Icon && <Icon className="text-[#c4b5fd]" aria-hidden="true" />}
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function SkeletonRows({ count = 3, height = 'h-14' }) {
    return (
        <div className="space-y-2.5">
            {Array.from({ length: count }, (_, i) => <div key={i} className={`${height} rounded-lg bg-white/[0.04] animate-pulse`} />)}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="gh-surface overflow-hidden">
                <div className="h-32 sm:h-48 bg-white/[0.04]" />
                <div className="px-4 sm:px-6 pb-5">
                    <div className="-mt-10 w-24 h-24 rounded-full bg-[#171a22] border-4 border-[#111319]" />
                    <div className="h-6 w-40 bg-white/[0.06] rounded mt-4" />
                    <div className="h-4 w-64 max-w-full bg-white/[0.04] rounded mt-3" />
                </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2 h-64 gh-surface" />
                <div className="h-64 gh-surface" />
            </div>
        </div>
    );
}

function Stat({ icon: Icon, color, label, value }) {
    return (
        <div className="rounded-xl bg-[#171a22] border border-white/[0.06] p-3 text-center min-w-0">
            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} aria-hidden="true" />
            <p className="text-lg font-extrabold text-white leading-none truncate">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7080] mt-1.5 truncate">{label}</p>
        </div>
    );
}

function ReportModal({ open, onClose, targetUid }) {
    const { user } = useContext(UserContext) || {};
    const { t } = useT();
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [details, setDetails] = useState('');
    const [state, setState] = useState('idle');

    useEffect(() => {
        if (open) setState('idle');
    }, [open]);

    async function submit(event) {
        event.preventDefault();
        if (!user) return;
        setState('sending');
        try {
            const { db, collection, addDoc, serverTimestamp } = await firestore();
            const text = details.trim().slice(0, 300);
            await addDoc(collection(db, 'reports'), {
                type: 'profile',
                targetId: targetUid,
                reason: text ? `${reason}: ${text}` : reason,
                uid: user.uid,
                createdAt: serverTimestamp(),
            });
            setState('sent');
            setDetails('');
        } catch (error) {
            console.error('Report failed:', error);
            setState('error');
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={t('social.report.title')} subtitle={t('social.report.subtitle')}>
            {state === 'sent' ? (
                <div className="text-center py-6">
                    <BsCheck2 className="mx-auto text-3xl text-emerald-400 mb-2" aria-hidden="true" />
                    <p className="text-sm text-[#c9ccd4]">{t('social.report.thanks')}</p>
                    <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary mt-5">{t('social.close')}</button>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <Field label={t('social.report.reason')}>
                        <select value={reason} onChange={e => setReason(e.target.value)} className={inputClass}>
                            {REPORT_REASONS.map(r => <option key={r} value={r}>{t(`social.report.reasons.${r}`)}</option>)}
                        </select>
                    </Field>
                    <Field label={t('social.report.details')} hint={`${details.length}/300`}>
                        <textarea
                            value={details}
                            maxLength={300}
                            onChange={e => setDetails(e.target.value)}
                            rows={3}
                            className={`${inputClass} h-auto py-2 resize-none`}
                        />
                    </Field>
                    {state === 'error' && <p className="text-sm text-red-400">{t('social.report.error')}</p>}
                    <button type="submit" disabled={state === 'sending'} className="gh-btn gh-btn-danger w-full">{t('social.report.submit')}</button>
                </form>
            )}
        </Modal>
    );
}

export default function PublicProfilePage() {
    const { username: param = '' } = useParams();
    const { user, profile: myProfile, authReady } = useContext(UserContext) || {};
    const { t, locale } = useT();
    const [found, setFound] = useState(undefined); // undefined = loading, null = not found

    useEffect(() => {
        let alive = true;
        setFound(undefined);
        findProfileByUsername(param)
            .then(result => alive && setFound(result))
            .catch(() => alive && setFound(null));
        return () => { alive = false; };
    }, [param]);

    // If the lookup was denied but the name is yours, it's your own (private) profile
    const ownByName = Boolean(user && myProfile?.username && myProfile.username.toLowerCase() === param.toLowerCase());
    const isOwn = Boolean(user && ((found?.uid && found.uid === user.uid) || (found?.private && ownByName)));
    // Your own profile: prefer the fresher copy from the context
    const profile = useMemo(
        () => (isOwn && myProfile ? { ...(found?.private ? {} : found), ...myProfile, uid: user.uid } : found),
        [isOwn, found, myProfile, user],
    );
    const uid = profile?.uid;
    const hidden = Boolean(profile) && (profile.private || (profile.isPublic === false && !isOwn));

    if (found === undefined || (!authReady && (found?.isPublic === false || found?.private))) {
        return <PageShell><ProfileSkeleton /></PageShell>;
    }

    if (!profile) {
        return (
            <PageShell title={t('social.profile.notFoundTitle')}>
                <EmptyState
                    icon={BsPersonX}
                    title={t('social.profile.notFoundTitle')}
                    text={t('social.profile.notFoundText', { username: param })}
                    action={<Link to="/leaderboard" className="gh-btn gh-btn-secondary">{t('social.profile.browsePlayers')}</Link>}
                />
            </PageShell>
        );
    }

    if (hidden) {
        return (
            <PageShell title={profile.username || param}>
                <EmptyState icon={BsLockFill} title={t('social.profile.privateTitle')} text={t('social.profile.privateText')} />
            </PageShell>
        );
    }

    return <ProfileView key={uid} profile={profile} isOwn={isOwn} locale={locale} />;
}

function ProfileView({ profile, isOwn, locale }) {
    const { user } = useContext(UserContext) || {};
    const { t } = useT();
    const uid = profile.uid;
    const counts = useFollowCounts(uid);
    const [listKind, setListKind] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activity, setActivity] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [library, setLibrary] = useState(null); // null loading, false hidden

    // The cover image lives in publicBanners/{uid} (kept out of the list-friendly public profile doc)
    const [bannerDoc, setBannerDoc] = useState(null);
    useEffect(() => {
        if (profile.banner || !profile.hasBanner) return undefined;
        let alive = true;
        loadPublicBanner(uid).then(data => alive && setBannerDoc(data)).catch(() => {});
        return () => { alive = false; };
    }, [uid, profile.banner, profile.hasBanner]);
    const banner = profile.banner || bannerDoc?.banner;

    const accent = getAccent(profile.accent);
    const level = levelInfoOf(profile);
    const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);

    useEffect(() => {
        if (profile.username) document.title = `${profile.username} · GameDataHub`;
    }, [profile.username]);

    useEffect(() => {
        let alive = true;
        loadActivityFor([uid], 8)
            .then(list => alive && setActivity(list))
            .catch(() => alive && setActivity([]));
        loadUserReviews(uid)
            .then(list => alive && setReviews(list.slice(0, 4)))
            .catch(() => alive && setReviews([]));
        firestore()
            .then(async ({ db, collection, query, orderBy, limit, getDocs }) => {
                const snap = await getDocs(query(collection(db, 'users', uid, 'library'), orderBy('updatedAt', 'desc'), limit(24)));
                return snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(item => item.status === 'playing' || item.status === 'completed')
                    .slice(0, 12);
            })
            .then(list => alive && setLibrary(list))
            .catch(() => alive && setLibrary(false));
        return () => { alive = false; };
    }, [uid]);

    const share = useCallback(async () => {
        const url = `${window.location.origin}${profileHref(profile.username)}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: t('social.profile.shareTitle', { username: profile.username }), url });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt(t('social.profile.copyPrompt'), url);
        }
    }, [profile.username, t]);

    const badges = useMemo(
        () => [...(profile.challengeBadges || [])].sort((a, b) => (b.earnedAt || 0) - (a.earnedAt || 0)),
        [profile.challengeBadges],
    );
    const libraryStats = LIBRARY_STAT_KEYS.filter(key => Number.isFinite(Number(profile.libraryStats?.[key])) && profile.libraryStats?.[key] != null);

    return (
        <PageShell>
            {isOwn && profile.isPublic === false && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
                    <BsLockFill aria-hidden="true" className="shrink-0" /> {t('social.profile.ownPrivateNote')}
                </div>
            )}

            {/* Hero */}
            <div className="gh-surface overflow-hidden">
                <div
                    className="relative h-32 sm:h-48 bg-cover"
                    style={banner
                        ? { backgroundImage: `url(${banner})`, backgroundPosition: `center ${profile.bannerPosY ?? 50}%` }
                        : { background: bannerBackground(profile) }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-transparent to-transparent" />
                </div>
                <div className="px-4 sm:px-6 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 -mt-12 sm:-mt-14 relative">
                        <ProfileAvatar profile={profile} ring className="w-24 h-24 sm:w-28 sm:h-28 text-4xl" />
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">{profile.username}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <TierBadge profile={profile} />
                                {Number(profile.bestStreak) > 1 && (
                                    <span className="gh-chip !text-orange-300"><BsFire aria-hidden="true" /> {t('social.profile.bestStreakChip', { count: Number(profile.bestStreak) })}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {isOwn ? (
                                <Link to="/profile" className="gh-btn gh-btn-secondary"><BsPencilSquare aria-hidden="true" /> {t('social.profile.edit')}</Link>
                            ) : (
                                <FollowButton targetUid={uid} targetUsername={profile.username} />
                            )}
                            <button type="button" onClick={share} className="gh-btn gh-btn-secondary" aria-live="polite">
                                {copied ? <BsCheck2 aria-hidden="true" /> : <BsShare aria-hidden="true" />}
                                {copied ? t('social.profile.copied') : t('social.profile.share')}
                            </button>
                            {user && !isOwn && (
                                <button type="button" onClick={() => setReportOpen(true)} className="gh-icon-btn" aria-label={t('social.report.title')} title={t('social.report.title')}>
                                    <BsFlag aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>

                    {profile.bio && <p className="text-[#c9ccd4] mt-4 max-w-2xl leading-relaxed break-words whitespace-pre-line">{String(profile.bio).slice(0, 300)}</p>}

                    {(profile.platforms?.length > 0 || profile.genres?.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {(profile.platforms || []).map(p => (
                                <span key={`p-${p}`} className="gh-chip" style={{ borderColor: `${accent.from}55`, color: '#eceef2' }}><BsController aria-hidden="true" style={{ color: accent.from }} /> {p}</span>
                            ))}
                            {(profile.genres || []).map(g => <span key={`g-${g}`} className="gh-chip">{g}</span>)}
                        </div>
                    )}

                    <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/[0.06] text-sm">
                        <button type="button" onClick={() => setListKind('followers')} className="text-[#a1a6b3] hover:text-white">
                            <span className="font-bold text-white">{counts ? nf.format(counts.followers) : '–'}</span> {t('social.profile.followers')}
                        </button>
                        <button type="button" onClick={() => setListKind('following')} className="text-[#a1a6b3] hover:text-white">
                            <span className="font-bold text-white">{counts ? nf.format(counts.following) : '–'}</span> {t('social.profile.following')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2 space-y-4 min-w-0">
                    <Section title={t('social.profile.activity')} icon={BsActivity}>
                        {activity === null ? <SkeletonRows /> : activity.length === 0 ? (
                            <p className="text-sm text-[#6b7080]">{t('social.profile.noActivity')}</p>
                        ) : (
                            <div className="divide-y divide-white/[0.06] -my-3">
                                {activity.map(item => <ActivityItem key={item.id} item={item} profile={profile} compact />)}
                            </div>
                        )}
                    </Section>

                    <Section title={t('social.profile.reviews')} icon={BsStarFill}>
                        {reviews === null ? <SkeletonRows count={2} height="h-20" /> : reviews.length === 0 ? (
                            <p className="text-sm text-[#6b7080]">{t('social.profile.noReviews')}</p>
                        ) : (
                            <div className="space-y-2.5">
                                {reviews.map((r, i) => (
                                    <Link
                                        key={r.id ?? i}
                                        to={r.gameKey && parseGameKey(r.gameKey) ? gameHref(r.gameKey) : `/reviews/${r.gameId}`}
                                        className="block rounded-xl bg-[#171a22] border border-white/[0.06] p-3 hover:border-white/[0.14] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-semibold text-white truncate">{r.gameName || t('social.feed.aGame')}</p>
                                            <span className="shrink-0 text-sm" aria-label={t('social.profile.rating', { rating: Number(r.rating) || 0 })}>
                                                {[1, 2, 3, 4, 5].map(n => <span key={n} className={n <= Number(r.rating) ? 'text-amber-400' : 'text-[#3a3f4b]'}>★</span>)}
                                            </span>
                                        </div>
                                        {r.review && <p className="text-sm text-[#a1a6b3] mt-1 line-clamp-2 break-words">{String(r.review).slice(0, 240)}</p>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>

                    {library !== false && (library === null || library.length > 0) && (
                        <Section title={t('social.profile.library')} icon={BsController}>
                            {library === null ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {[0, 1, 2].map(i => <div key={i} className="aspect-[16/9] rounded-lg bg-white/[0.04] animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {library.map(item => {
                                        const key = item.gameKey || item.id;
                                        const name = item.name || item.gameName || key;
                                        const done = item.status === 'completed';
                                        return (
                                            <Link key={item.id} to={gameHref(key)} className="group relative block aspect-[16/9] rounded-lg overflow-hidden bg-[#171a22] border border-white/[0.06]">
                                                {item.image && <img src={item.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                <span className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${done ? 'bg-amber-400/90 text-[#0a0b0f]' : 'bg-emerald-400/90 text-[#0a0b0f]'}`}>
                                                    {done ? <BsTrophyFill aria-hidden="true" /> : <BsController aria-hidden="true" />}
                                                    {done ? t('social.profile.statusCompleted') : t('social.profile.statusPlaying')}
                                                </span>
                                                <p className="absolute bottom-0 inset-x-0 p-2 text-xs font-semibold text-white truncate">{name}</p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </Section>
                    )}
                </div>

                <aside className="space-y-4 min-w-0">
                    <Section title={t('social.profile.stats')} icon={BsLightningChargeFill}>
                        <div className="grid grid-cols-3 gap-2">
                            <Stat icon={BsLightningChargeFill} color={level.tier?.color} label={t('social.profile.level')} value={level.level} />
                            <Stat icon={BsStarFill} color="#c4b5fd" label={t('social.profile.xp')} value={nf.format(level.xp)} />
                            <Stat icon={BsFire} color="#fb923c" label={t('social.profile.bestStreak')} value={nf.format(Number(profile.bestStreak) || 0)} />
                        </div>
                        <div className="mt-3">
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.round(level.progress * 100)}%`, background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />
                            </div>
                            <p className="text-xs text-[#6b7080] mt-1.5">{t('social.profile.toNext', { xp: nf.format(level.toNext), level: level.level + 1 })}</p>
                        </div>
                        {libraryStats.length > 0 && (
                            <>
                                <p className="gh-eyebrow mt-4 mb-2">{t('social.profile.libraryStats')}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {libraryStats.map(key => (
                                        <div key={key} className="rounded-lg bg-[#171a22] border border-white/[0.06] px-2 py-2 text-center min-w-0">
                                            <p className="text-base font-bold text-white leading-none">{nf.format(Number(profile.libraryStats[key]))}</p>
                                            <p className="text-[10px] uppercase tracking-wide text-[#6b7080] mt-1 truncate">{t(`social.libraryStats.${key}`)}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Section>

                    <Section
                        title={t('social.profile.badges')}
                        icon={BsAwardFill}
                        action={<Link to="/challenges" className="text-xs text-[#a1a6b3] hover:text-white inline-flex items-center gap-1">{t('social.profile.challengesLink')} <BsBoxArrowUpRight aria-hidden="true" /></Link>}
                    >
                        {badges.length === 0 ? (
                            <p className="text-sm text-[#6b7080]">{t('social.profile.noBadges')}</p>
                        ) : (
                            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-1 gap-2">
                                {badges.slice(0, 12).map(b => <ChallengeBadge key={`${b.id}-${b.month}`} badge={b} />)}
                            </div>
                        )}
                    </Section>
                </aside>
            </div>

            <FollowListModal uid={uid} kind={listKind} username={profile.username} onClose={() => setListKind(null)} />
            <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetUid={uid} />
        </PageShell>
    );
}
