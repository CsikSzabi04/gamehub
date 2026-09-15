import React, { useState, useEffect, useContext, useMemo } from 'react';
import { signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaEnvelope, FaCalendarAlt, FaSignOutAlt, FaPen, FaFire, FaStar, FaHeart, FaTrophy, FaLock,
    FaSteam, FaDiscord, FaTwitch, FaYoutube, FaDesktop, FaPlaystation, FaXbox, FaMobileAlt,
    FaGamepad, FaCheckCircle, FaExclamationTriangle, FaKey, FaBolt, FaCamera, FaChartLine,
} from 'react-icons/fa';
import { BsNintendoSwitch } from 'react-icons/bs';
import { auth, firestore } from '../../firebaseConfig';
import { UserContext } from '../Features/UserContext.jsx';
import { cachedFetch } from '../Components/apiCache.js';
import Footer from '../Footer';
import Header from '../Header';
import EditProfileModal from '../Components/profile/EditProfileModal.jsx';
import ProfileQuickLinks from '../Components/profile/ProfileQuickLinks.jsx';
import MyPcCard from '../Components/profile/MyPcCard.jsx';
import PlatformConnections from '../Components/profile/PlatformConnections.jsx';
import GamerProgressCard from '../Components/profile/GamerProgressCard.jsx';
import AccountDataCard from '../account/AccountDataCard.jsx';
import { challengeBadgesXp } from '../challenges/challenges.js';
import { useLibrary } from '../library/useLibrary.js';
import { useAchievementOverview } from '../achievements/achievementsApi.js';
import { GAMER_XP_RULES, evaluateGamerBadges, gamerStats, gamerXp } from '../achievements/gamerProgress.js';
import LanguageSwitcher from '../Components/LanguageSwitcher.jsx';
import { translate, useT } from '../i18n/index.jsx';
import {
    getAccent, bannerBackground, computeXp, getLevelInfo, evaluateBadges, dateKey, XP_RULES,
} from '../Components/profile/profileUtils.js';

const API = 'https://gamehub-backend-zekj.onrender.com';

const PLATFORM_ICONS = {
    PC: FaDesktop,
    PlayStation: FaPlaystation,
    Xbox: FaXbox,
    Switch: BsNintendoSwitch,
    Mobile: FaMobileAlt,
};

const SOCIAL_LINKS = [
    { key: 'steam', icon: FaSteam, color: '#c7d5e0', url: v => `https://steamcommunity.com/id/${encodeURIComponent(v)}` },
    { key: 'discord', icon: FaDiscord, color: '#5865f2', url: null },
    { key: 'twitch', icon: FaTwitch, color: '#a970ff', url: v => `https://twitch.tv/${encodeURIComponent(v)}` },
    { key: 'youtube', icon: FaYoutube, color: '#ff0033', url: v => `https://youtube.com/@${encodeURIComponent(v.replace(/^@/, ''))}` },
];

const TABS = ['overview', 'reviews', 'favorites', 'badges', 'account'];

const tierName = (t, tier) => t(`profile.tiers.${tier.name.toLowerCase()}`);

/* ---------- Small building blocks ---------- */

function Card({ className = '', children }) {
    return <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl ${className}`}>{children}</div>;
}

function SectionTitle({ accent, children, action }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-white">
                <span className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(${accent.from}, ${accent.to})` }} />
                {children}
            </h2>
            {action}
        </div>
    );
}

function Stars({ value }) {
    return (
        <span className="text-sm tracking-tight shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= value ? 'text-amber-400' : 'text-gray-700'}>★</span>
            ))}
        </span>
    );
}

function GameThumb({ image, name, className = '' }) {
    if (image) return <img src={image} alt={name} loading="lazy" className={`object-cover ${className}`} />;
    return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-violet-600/40 to-cyan-600/30 ${className}`}>
            <span className="text-xl font-black text-white/80">{(name || '?')[0]}</span>
        </div>
    );
}

function EmptyState({ icon: Icon, title, text, cta }) {
    return (
        <div className="text-center py-10 px-4">
            <Icon className="mx-auto w-10 h-10 text-gray-700 mb-4" />
            <p className="text-white font-semibold">{title}</p>
            <p className="text-gray-500 text-sm mt-1">{text}</p>
            {cta}
        </div>
    );
}

function LevelRing({ info, accent, size = 128 }) {
    const { t } = useT();
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id="levelRingGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={accent.from} />
                        <stop offset="100%" stopColor={accent.to} />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="url(#levelRingGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    initial={{ strokeDashoffset: c }}
                    animate={{ strokeDashoffset: c * (1 - info.progress) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('profile.level')}</span>
                <span className="text-4xl font-black text-white leading-none">{info.level}</span>
            </div>
        </div>
    );
}

function BadgeTile({ badge, compact }) {
    const { t } = useT();
    const Icon = badge.icon;
    const name = t(`profile.badgeList.${badge.id}.name`);
    const desc = t(`profile.badgeList.${badge.id}.desc`);
    return (
        <motion.div
            whileHover={{ y: -3 }}
            title={`${name}: ${desc}`}
            className={`relative rounded-2xl border p-4 ${badge.unlocked ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.015]'}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={badge.unlocked
                        ? { background: `${badge.color}22`, color: badge.color, boxShadow: `0 0 24px ${badge.color}33` }
                        : { background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}
                >
                    {badge.unlocked ? <Icon className="w-5 h-5" /> : <FaLock className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>{name}</p>
                    {!compact && <p className="text-xs text-gray-500 truncate">{desc}</p>}
                </div>
            </div>
            {!compact && !badge.unlocked && (
                <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(badge.current / badge.target) * 100}%`, background: badge.color }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 text-right">{badge.current} / {badge.target}</p>
                </div>
            )}
        </motion.div>
    );
}

function ReviewItem({ review, image }) {
    return (
        <Link
            to={`/reviews/${review.gameId}`}
            className="group flex gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all"
        >
            <GameThumb image={image} name={review.gameName} className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold truncate group-hover:text-violet-300 transition-colors">{review.gameName}</h3>
                    <Stars value={review.rating} />
                </div>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{review.review}</p>
            </div>
        </Link>
    );
}

function FavoriteTile({ fav, image }) {
    return (
        <Link to={`/reviews/${fav.gameId}`} className="group relative block rounded-2xl overflow-hidden aspect-[4/3] border border-white/10">
            <GameThumb image={image} name={fav.name} className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <FaHeart className="absolute top-3 right-3 w-4 h-4 text-pink-500 drop-shadow" />
            <p className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold text-white truncate">{fav.name}</p>
        </Link>
    );
}

function MiniReview({ review, image }) {
    return (
        <Link to={`/reviews/${review.gameId}`} className="group flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-colors min-w-0">
            <GameThumb image={image} name={review.gameName} className="w-12 h-9 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate group-hover:text-violet-300 transition-colors">{review.gameName}</p>
                <Stars value={review.rating} />
            </div>
        </Link>
    );
}

function MiniFavorite({ fav, image }) {
    return (
        <Link to={`/reviews/${fav.gameId}`} title={fav.name} className="group relative block rounded-xl overflow-hidden aspect-[4/3] border border-white/10">
            <GameThumb image={image} name={fav.name} className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
            <p className="absolute bottom-0 left-0 right-0 px-1.5 pb-1 text-[10px] font-semibold text-white truncate">{fav.name}</p>
        </Link>
    );
}

function AccountRow({ icon: Icon, label, value, children }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="p-2.5 rounded-xl bg-white/5 text-gray-300"><Icon className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-white font-medium truncate">{value}</p>
            </div>
            {children}
        </div>
    );
}

function CtaLink({ to, gradient, children }) {
    return (
        <Link to={to} className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: gradient }}>
            {children}
        </Link>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-3">
            {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-white/[0.04] animate-pulse" />)}
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(i => <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.04] animate-pulse" />)}
        </div>
    );
}

function ViewAll({ onClick }) {
    const { t } = useT();
    return <button onClick={onClick} className="text-xs text-gray-400 hover:text-white transition-colors">{t('common.viewAll')}</button>;
}

/* ---------- Page ---------- */

export default function Profile({ setUser }) {
    const { user, profile, setProfile, authReady } = useContext(UserContext);
    const { t, locale } = useT();
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [editing, setEditing] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [games, setGames] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [reviewSort, setReviewSort] = useState('newest');
    const { items: libraryItems, loading: libraryLoading } = useLibrary();
    // Live: the backend keeps updating these while an achievement sync runs
    const { stats: liveAchievementStats, sync: liveSync, loading: overviewLoading } = useAchievementOverview(user?.uid);

    useEffect(() => {
        if (authReady && !user) navigate('/login');
    }, [authReady, user, navigate]);

    useEffect(() => {
        if (!user) return;
        let alive = true;

        async function loadActivity() {
            const [reviewsRes, favRes, gamesRes] = await Promise.allSettled([
                fetch(`${API}/get-all-reviews`).then(r => r.json()),
                fetch(`${API}/getFav?userId=${user.uid}`).then(r => r.json()),
                cachedFetch(`${API}/fetch-games`),
            ]);
            if (!alive) return;
            if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
                setReviews(reviewsRes.value.filter(r => r.userId === user.uid || r.email === user.email));
            }
            if (favRes.status === 'fulfilled' && Array.isArray(favRes.value)) setFavorites(favRes.value);
            if (gamesRes.status === 'fulfilled') setGames(gamesRes.value?.games || []);
            setActivityLoading(false);
        }

        loadActivity();
        return () => { alive = false; };
    }, [user]);

    const imageFor = useMemo(() => {
        const map = new Map(games.map(g => [String(g.id), g.background_image]));
        return (gameId, fallback) => fallback || map.get(String(gameId));
    }, [games]);

    const derived = useMemo(() => {
        if (!user || !profile) return null;
        const memberDays = Math.max(0, Math.floor((Date.now() - new Date(user.metadata.creationTime)) / 86400000));
        const gamer = gamerStats({
            ...profile,
            achievementStats: liveAchievementStats || profile.achievementStats,
            platformSync: overviewLoading ? profile.platformSync : liveSync,
        }, libraryItems);
        const level = getLevelInfo(computeXp({ profile, reviews, favorites, memberDays }) + challengeBadgesXp(profile) + gamerXp(gamer));

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const streakAlive = [dateKey(new Date()), dateKey(yesterday)].includes(profile.lastActiveDate);

        const ratings = reviews.map(r => Number(r.rating) || 0).filter(Boolean);
        const badges = [
            ...evaluateBadges({
                reviews: reviews.length,
                favorites: favorites.length,
                longestReview: Math.max(0, ...reviews.map(r => (r.review || '').length)),
                fiveStars: ratings.filter(r => r === 5).length,
                bestStreak: profile.bestStreak || 0,
                activeDays: profile.activeDays || 0,
                styled: (profile.avatar ? 1 : 0) + (profile.banner ? 1 : 0),
                memberDays,
                level: level.level,
            }),
            ...evaluateGamerBadges(gamer),
        ];

        return {
            level,
            gamer,
            memberDays,
            streak: streakAlive ? profile.streak || 0 : 0,
            avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '–',
            badges,
            unlockedCount: badges.filter(b => b.unlocked).length,
            completion: [
                { key: 'avatar', done: Boolean(profile.avatar) },
                { key: 'banner', done: Boolean(profile.banner) },
                { key: 'bio', done: Boolean(profile.bio) },
                { key: 'platforms', done: Boolean(profile.platforms?.length) },
                { key: 'genres', done: Boolean(profile.genres?.length) },
            ],
        };
    }, [user, profile, reviews, favorites, libraryItems, liveAchievementStats, liveSync, overviewLoading]);

    // Celebrate a level up once activity (and so the real XP) has loaded
    const currentLevel = derived?.level.level;
    const progressLoading = activityLoading || libraryLoading || overviewLoading;
    useEffect(() => {
        if (!currentLevel || progressLoading || !user) return;
        const key = `gdh-level-${user.uid}`;
        try {
            const seen = Number(localStorage.getItem(key)) || 0;
            if (seen && currentLevel > seen) {
                toast.success(t('profile.levelUp', { level: currentLevel }), { icon: '🎉', duration: 5000 });
            }
            localStorage.setItem(key, String(currentLevel));
        } catch {
            // storage unavailable, skip the celebration
        }
    }, [currentLevel, progressLoading, user]); // eslint-disable-line react-hooks/exhaustive-deps -- t only formats the toast

    // Public data for the leaderboard / public profile (/u/:username): XP, level and a lowercase handle
    const syncXp = derived?.level.xp;
    useEffect(() => {
        if (progressLoading || !user || !profile || syncXp == null) return;
        const usernameLower = (profile.username || '').trim().toLowerCase();
        if (profile.xp === syncXp && profile.level === currentLevel && profile.usernameLower === usernameLower) return;
        const fields = { xp: syncXp, level: currentLevel, usernameLower };
        setDoc(doc(firestore, 'users', user.uid), fields, { merge: true })
            .then(() => setProfile(prev => ({ ...prev, ...fields })))
            .catch(error => console.error('Could not sync XP:', error));
    }, [progressLoading, user, profile, syncXp, currentLevel, setProfile]);

    const sortedReviews = useMemo(() => {
        const list = [...reviews];
        if (reviewSort === 'high') return list.sort((a, b) => b.rating - a.rating);
        if (reviewSort === 'low') return list.sort((a, b) => a.rating - b.rating);
        return list.reverse();
    }, [reviews, reviewSort]);

    async function handleSave(draft) {
        draft = { ...draft, usernameLower: (draft.username || '').trim().toLowerCase() };
        await setDoc(doc(firestore, 'users', user.uid), draft, { merge: true });
        if (draft.username !== auth.currentUser.displayName) {
            await updateProfile(auth.currentUser, { displayName: draft.username }).catch(() => {});
        }
        setProfile(prev => ({ ...prev, ...draft }));
        toast.success(t('profile.updated'));
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            setUser?.(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(t('profile.logoutFailed'));
        }
    }

    async function handleVerify() {
        try {
            await sendEmailVerification(auth.currentUser);
            toast.success(t('profile.verificationSent'));
        } catch {
            toast.error(t('profile.verificationFailed'));
        }
    }

    async function handlePasswordReset() {
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success(t('profile.resetSent'));
        } catch {
            toast.error(t('profile.resetFailed'));
        }
    }

    if (!authReady || !user || !profile || !derived) {
        return (
            <div className="flex flex-col min-h-screen bg-[#030712]">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"
                        />
                        <p className="text-gray-400 mt-4">{authReady && !user ? t('profile.redirecting') : t('profile.loading')}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const accent = getAccent(profile.accent);
    const gradient = `linear-gradient(135deg, ${accent.from}, ${accent.to})`;
    const { level } = derived;
    const joined = new Date(user.metadata.creationTime).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const socials = SOCIAL_LINKS.filter(s => profile.socials?.[s.key]);
    const tabCounts = { reviews: reviews.length, favorites: favorites.length, badges: `${derived.unlockedCount}/${derived.badges.length}` };
    const completionDone = derived.completion.filter(c => c.done).length;

    const statItems = [
        { label: t('profile.stats.reviews'), value: reviews.length, icon: FaPen, color: '#a78bfa', remote: true },
        { label: t('profile.stats.favorites'), value: favorites.length, icon: FaHeart, color: '#f472b6', remote: true },
        { label: t('profile.stats.avgRating'), value: derived.avgRating, icon: FaStar, color: '#facc15', remote: true },
        { label: t('profile.stats.dayStreak'), value: derived.streak, icon: FaFire, color: '#fb923c' },
        { label: t('profile.stats.activeDays'), value: profile.activeDays || 0, icon: FaChartLine, color: '#34d399' },
        { label: t('profile.stats.badges'), value: derived.unlockedCount, icon: FaTrophy, color: '#38bdf8', remote: true },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#030712]">
            <Header />
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="overflow-hidden">
                        {/* Cover */}
                        <div
                            className="relative h-40 sm:h-56 md:h-64 bg-cover"
                            style={profile.banner
                                ? { backgroundImage: `url(${profile.banner})`, backgroundPosition: `center ${profile.bannerPosY ?? 50}%` }
                                : { background: bannerBackground(profile) }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-black/20" />
                            <button
                                onClick={() => setEditing(true)}
                                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur text-xs font-semibold text-white border border-white/10 transition-colors"
                            >
                                <FaCamera className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('profile.changeCover')}</span>
                            </button>
                        </div>

                        <div className="relative px-5 sm:px-8 pb-6">
                            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-16 sm:-mt-20">
                                {/* Avatar */}
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                                    <div className="absolute -inset-1 rounded-full blur-xl opacity-50" style={{ background: gradient }} />
                                    <div className="relative w-full h-full rounded-full p-1" style={{ background: gradient }}>
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="group relative w-full h-full rounded-full overflow-hidden bg-[#0b0f1a] flex items-center justify-center border-4 border-[#070b14]"
                                            aria-label={t('profile.changePicture')}
                                        >
                                            {profile.avatar
                                                ? <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                                                : <span className="text-5xl font-black text-white">{profile.username[0].toUpperCase()}</span>}
                                            <span className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaCamera className="w-6 h-6 text-white" />
                                            </span>
                                        </button>
                                    </div>
                                    <div
                                        className="absolute bottom-1 right-1 min-w-[2.5rem] h-10 px-2 rounded-full flex items-center justify-center text-sm font-black text-white border-4 border-[#070b14] shadow-lg"
                                        style={{ background: gradient }}
                                        title={t('profile.levelN', { level: level.level })}
                                    >
                                        {level.level}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0 md:pb-2">
                                    <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white truncate">
                                        {profile.username}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em]" style={{ color: level.tier.color }}>
                                            <FaBolt className="w-3 h-3" /> {tierName(t, level.tier)}
                                        </span>
                                        {derived.streak > 1 && (
                                            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-orange-400">
                                                <FaFire className="w-3 h-3" /> {t('profile.dayStreak', { count: derived.streak })}
                                            </span>
                                        )}
                                        {user.emailVerified && (
                                            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-400">
                                                <FaCheckCircle className="w-3 h-3" /> {t('profile.verified')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">@{profile.username.toLowerCase().replace(/\s+/g, '')}</p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setEditing(true)}
                                    className="self-start md:self-auto md:mb-3 flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-[0.15em] text-white transition-colors"
                                >
                                    <FaPen className="w-3 h-3" /> {t('profile.editProfile')}
                                </motion.button>
                            </div>

                            {profile.bio && <p className="text-gray-300 mt-5 max-w-2xl leading-relaxed break-words">{profile.bio}</p>}

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-5 border-t border-white/5 text-sm text-gray-500">
                                <span className="flex items-center gap-2"><FaCalendarAlt className="w-3.5 h-3.5" /> {t('profile.joined', { date: joined })}</span>
                                {profile.playing && (
                                    <span className="flex items-center gap-2 min-w-0">
                                        <FaGamepad className="w-3.5 h-3.5 shrink-0" style={{ color: accent.from }} />
                                        {t('profile.playing')} <span className="text-gray-200 font-medium truncate">{profile.playing}</span>
                                    </span>
                                )}
                                {profile.platforms?.length > 0 && (
                                    <span className="flex items-center gap-3">
                                        {profile.platforms.map(p => {
                                            const Icon = PLATFORM_ICONS[p];
                                            return Icon ? <Icon key={p} className="w-4 h-4 text-gray-300" title={p} /> : null;
                                        })}
                                    </span>
                                )}
                                {socials.length > 0 && (
                                    <span className="flex items-center gap-2 md:ml-auto">
                                        {socials.map(({ key, icon: Icon, color, url }) => {
                                            const value = profile.socials[key];
                                            const inner = <Icon className="w-4 h-4" style={{ color }} />;
                                            return url ? (
                                                <a key={key} href={url(value)} target="_blank" rel="noopener noreferrer" title={value} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">{inner}</a>
                                            ) : (
                                                <button
                                                    key={key}
                                                    title={t('profile.clickToCopy', { value })}
                                                    onClick={() => navigator.clipboard?.writeText(value).then(() => toast.success(t('profile.discordCopied')))}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    {inner}
                                                </button>
                                            );
                                        })}
                                    </span>
                                )}
                            </div>

                            {/* XP bar */}
                            <div className="mt-6">
                                <div className="flex items-end justify-between gap-3 text-[11px] font-black uppercase tracking-[0.15em] mb-2">
                                    <span style={{ color: accent.from }}>{t('profile.levelN', { level: level.level })} · {tierName(t, level.tier)}</span>
                                    <span className="text-gray-500">{level.intoLevel.toLocaleString(locale)} / {level.levelSpan.toLocaleString(locale)} XP</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: gradient, boxShadow: `0 0 16px ${accent.from}88` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${level.progress * 100}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {t('profile.xpToNext', { xp: level.toNext.toLocaleString(locale), level: level.level + 1 })} · {t('profile.xpTotal', { xp: level.xp.toLocaleString(locale) })}
                                    {activityLoading && <span className="ml-2 text-gray-600">{t('profile.syncing')}</span>}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
                                {statItems.map(({ label, value, icon: Icon, color, remote }) => (
                                    <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-3 sm:p-4 text-center">
                                        <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
                                        <p className="text-xl sm:text-2xl font-black text-white leading-none">{activityLoading && remote ? '…' : value}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mt-2">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <ProfileQuickLinks profile={profile} />

                {/* ---------- Tabs ---------- */}
                <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
                    {TABS.map(tabKey => {
                        const active = tab === tabKey;
                        return (
                            <button
                                key={tabKey}
                                onClick={() => setTab(tabKey)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] border transition-all ${active ? '' : 'text-gray-400 border-white/10 hover:text-white hover:border-white/20'}`}
                                style={active ? { borderColor: accent.from, background: `${accent.from}22`, color: accent.from } : undefined}
                            >
                                {t(`profile.tabs.${tabKey}`)}{tabCounts[tabKey] !== undefined && !activityLoading && ` (${tabCounts[tabKey]})`}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* ---------- Main column ---------- */}
                    <div className="lg:col-span-2 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {tab === 'overview' && (
                                    <>
                                        {(profile.genres?.length > 0 || profile.platforms?.length > 0) && (
                                            <Card className="p-6">
                                                <SectionTitle accent={accent}>{t('profile.gamerDna')}</SectionTitle>
                                                {profile.platforms?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {profile.platforms.map(p => {
                                                            const Icon = PLATFORM_ICONS[p] || FaGamepad;
                                                            return (
                                                                <span key={p} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white">
                                                                    <Icon className="w-4 h-4" style={{ color: accent.from }} /> {p}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.genres?.map(g => (
                                                        <span key={g} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: `${accent.to}26`, border: `1px solid ${accent.to}55` }}>
                                                            {t(`profile.genres.${g}`)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </Card>
                                        )}

                                        <Card className="p-6">
                                            <SectionTitle accent={accent} action={<ViewAll onClick={() => setTab('badges')} />}>{t('profile.badges')}</SectionTitle>
                                            {derived.unlockedCount === 0 ? (
                                                <p className="text-gray-500 text-sm">{t('profile.noBadges')}</p>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {derived.badges.filter(b => b.unlocked).slice(0, 6).map(b => <BadgeTile key={b.id} badge={b} compact />)}
                                                </div>
                                            )}
                                        </Card>

                                        <GamerProgressCard Card={Card} SectionTitle={SectionTitle} accent={accent} gamer={derived.gamer} stats={liveAchievementStats || profile.achievementStats} />

                                        <MyPcCard Card={Card} SectionTitle={SectionTitle} accent={accent} gradient={gradient} />

                                        <PlatformConnections Card={Card} SectionTitle={SectionTitle} accent={accent} />
                                    </>
                                )}

                                {tab === 'reviews' && (
                                    <Card className="p-6">
                                        <SectionTitle
                                            accent={accent}
                                            action={
                                                <select
                                                    value={reviewSort}
                                                    onChange={e => setReviewSort(e.target.value)}
                                                    aria-label={t('profile.sortReviews')}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none"
                                                >
                                                    <option value="newest" className="bg-gray-900">{t('profile.sort.newest')}</option>
                                                    <option value="high" className="bg-gray-900">{t('profile.sort.high')}</option>
                                                    <option value="low" className="bg-gray-900">{t('profile.sort.low')}</option>
                                                </select>
                                            }
                                        >
                                            {t('profile.yourReviews')}
                                        </SectionTitle>
                                        {activityLoading ? <SkeletonList /> : reviews.length === 0 ? (
                                            <EmptyState icon={FaPen} title={t('profile.noReviews')} text={t('profile.shareReview')} cta={<CtaLink to="/review" gradient={gradient}>{t('profile.writeReview')}</CtaLink>} />
                                        ) : (
                                            <div className="space-y-3">
                                                {sortedReviews.map((r, i) => <ReviewItem key={i} review={r} image={imageFor(r.gameId)} />)}
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {tab === 'favorites' && (
                                    <Card className="p-6">
                                        <SectionTitle accent={accent}>{t('profile.favoriteGames')}</SectionTitle>
                                        {activityLoading ? <SkeletonGrid /> : favorites.length === 0 ? (
                                            <EmptyState icon={FaHeart} title={t('profile.noFavorites')} text={t('profile.noFavoritesHint')} cta={<CtaLink to="/hub" gradient={gradient}>{t('profile.discoverGames')}</CtaLink>} />
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {favorites.map((f, i) => <FavoriteTile key={i} fav={f} image={imageFor(f.gameId, f.background_image)} />)}
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {tab === 'badges' && (
                                    <Card className="p-6">
                                        <SectionTitle accent={accent} action={<span className="text-xs text-gray-400">{t('profile.unlockedOf', { unlocked: derived.unlockedCount, total: derived.badges.length })}</span>}>
                                            {t('profile.badges')}
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[...derived.badges].sort((a, b) => b.unlocked - a.unlocked).map(b => <BadgeTile key={b.id} badge={b} />)}
                                        </div>
                                    </Card>
                                )}

                                {tab === 'account' && (
                                    <Card className="p-6 space-y-3">
                                        <SectionTitle accent={accent}>{t('profile.account')}</SectionTitle>
                                        <AccountRow icon={FaEnvelope} label={t('profile.email')} value={user.email}>
                                            {user.emailVerified ? (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><FaCheckCircle /> {t('profile.verified')}</span>
                                            ) : (
                                                <button onClick={handleVerify} className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300">
                                                    <FaExclamationTriangle /> {t('profile.verifyNow')}
                                                </button>
                                            )}
                                        </AccountRow>
                                        <AccountRow icon={FaCalendarAlt} label={t('profile.memberSince')} value={t('profile.memberDays', { date: new Date(user.metadata.creationTime).toLocaleDateString(locale), count: derived.memberDays })} />
                                        <AccountRow icon={FaKey} label={t('profile.password')} value="••••••••">
                                            <button onClick={handlePasswordReset} className="text-xs font-semibold text-gray-300 hover:text-white">{t('profile.sendReset')}</button>
                                        </AccountRow>
                                        <AccountDataCard />
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={handleLogout}
                                            className="w-full mt-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-semibold flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all"
                                        >
                                            <FaSignOutAlt className="w-4 h-4" /> {t('profile.logout')}
                                        </motion.button>
                                    </Card>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ---------- Sidebar ---------- */}
                    <aside className="space-y-6">
                        <Card className="p-6">
                            <SectionTitle accent={accent}>{t('profile.language')}</SectionTitle>
                            <LanguageSwitcher className="w-full [&>button]:flex-1 [&>button]:justify-center" accent={gradient} onChange={code => toast.success(translate(code, 'profile.languageSaved'))} />
                            <p className="text-xs text-gray-500 mt-3">{t('profile.languageHint')}</p>
                        </Card>

                        <Card className="p-6">
                            <SectionTitle accent={accent}>{t('profile.yourRank')}</SectionTitle>
                            <div className="flex items-center gap-5">
                                <LevelRing info={level} accent={accent} />
                                <div className="min-w-0">
                                    <p className="text-xl font-black uppercase italic" style={{ color: level.tier.color }}>{tierName(t, level.tier)}</p>
                                    <p className="text-sm text-gray-400 mt-1">{t('profile.percentToLevel', { percent: Math.round(level.progress * 100), level: level.level + 1 })}</p>
                                    {level.nextTier && (
                                        <p className="text-xs text-gray-500 mt-3">
                                            {t('profile.reachLevelToBecome', { level: level.nextTier.minLevel })} <span className="font-bold" style={{ color: level.nextTier.color }}>{tierName(t, level.nextTier)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {completionDone < derived.completion.length && (
                            <Card className="p-6">
                                <SectionTitle accent={accent} action={<span className="text-xs font-bold text-gray-400">{completionDone}/{derived.completion.length}</span>}>
                                    {t('profile.completeProfile')}
                                </SectionTitle>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${(completionDone / derived.completion.length) * 100}%`, background: gradient }} />
                                </div>
                                <ul className="space-y-2">
                                    {derived.completion.map(c => (
                                        <li key={c.key} className={`flex items-center gap-3 text-sm ${c.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                            <FaCheckCircle className={`w-4 h-4 shrink-0 ${c.done ? 'text-emerald-500' : 'text-gray-700'}`} /> {t(`profile.completion.${c.key}`)}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setEditing(true)} className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: gradient }}>
                                    {t('profile.finishSetup')}
                                </button>
                            </Card>
                        )}

                        <Card className="p-6">
                            <SectionTitle accent={accent}>{t('profile.howToEarnXp')}</SectionTitle>
                            <ul className="space-y-3">
                                {[...XP_RULES, ...GAMER_XP_RULES].map(rule => (
                                    <li key={rule.key} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-gray-300">{t(`profile.xpRules.${rule.key}`)}</span>
                                        <span className="shrink-0 text-xs font-black px-2 py-1 rounded-lg" style={{ background: `${accent.from}22`, color: accent.from }}>+{rule.xp}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="p-5">
                            <SectionTitle accent={accent} action={reviews.length > 0 && <ViewAll onClick={() => setTab('reviews')} />}>
                                {t('profileExtras.recentReviewsShort')}
                            </SectionTitle>
                            {activityLoading ? (
                                <div className="space-y-2">{[0, 1, 2].map(i => <div key={i} className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
                            ) : reviews.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    {t('profile.noReviews')} <Link to="/review" className="text-violet-300 hover:text-white">{t('profile.writeReview')}</Link>
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {sortedReviews.slice(0, 3).map((r, i) => <MiniReview key={i} review={r} image={imageFor(r.gameId)} />)}
                                </div>
                            )}
                        </Card>

                        <Card className="p-5">
                            <SectionTitle accent={accent} action={favorites.length > 0 && <ViewAll onClick={() => setTab('favorites')} />}>
                                {t('profileExtras.favoritesShort')}
                            </SectionTitle>
                            {activityLoading ? (
                                <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <div key={i} className="aspect-[4/3] rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
                            ) : favorites.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    {t('profile.noFavorites')} <Link to="/hub" className="text-violet-300 hover:text-white">{t('profile.discoverGames')}</Link>
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {favorites.slice(0, 6).map((f, i) => <MiniFavorite key={i} fav={f} image={imageFor(f.gameId, f.background_image)} />)}
                                </div>
                            )}
                        </Card>
                    </aside>
                </div>
            </main>

            <AnimatePresence>
                {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} onSave={handleSave} />}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
