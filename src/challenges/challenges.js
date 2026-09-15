// Monthly community challenges. A deterministic pick of 4-5 challenges from POOL per month,
// measured on the client from the user's own data. Claimed badges live in
// users/{uid}.challengeBadges = [{ id, month: 'YYYY-MM', earnedAt: ms }] (max 60 entries).
//
//   const list = challengesForMonth(monthKeyOf(new Date()));
//   const ctx = await loadChallengeContext(user, profile);
//   list.map(c => ({ ...c, progress: Math.min(c.measure(ctx), c.target) }));
//   challengeBadgesXp(profile) -> bonus XP from claimed badges (for the profile XP total)
import {
    BsCollectionFill, BsController, BsFire, BsHeartFill, BsJournalText, BsPencilSquare,
    BsPeopleFill, BsPersonPlusFill, BsStarFill, BsTrophyFill,
} from 'react-icons/bs';
import { firestore, toDate } from '../lib/firebase.js';
import { apiGet } from '../lib/api.js';
import { dateKey } from '../Components/profile/profileUtils.js';
import { postActivity } from '../social/activity.js';
import { loadUserReviews, reviewDate } from '../social/profiles.js';

export const MAX_CHALLENGE_BADGES = 60;

/* ---------- Months ---------- */

export function monthKeyOf(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthRange(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

export function daysLeftInMonth(now = new Date()) {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.max(0, Math.ceil((end - now) / 86_400_000));
}

const inMonth = (value, monthKey) => {
    const date = toDate(value);
    if (!date) return false;
    const { start, end } = monthRange(monthKey);
    return date >= start && date < end;
};

/* ---------- Pool ---------- */

const libDate = (item, ...fields) => fields.map(f => item?.[f]).find(Boolean);

export const POOL = [
    {
        id: 'reviewer', icon: BsPencilSquare, color: '#a78bfa', target: 3, xp: 120,
        measure: ctx => ctx.reviews.length,
        cta: '/review',
    },
    {
        id: 'deepDive', icon: BsJournalText, color: '#22d3ee', target: 1, xp: 80,
        measure: ctx => ctx.reviews.filter(r => String(r.review || '').length >= 200).length,
        cta: '/review',
    },
    {
        id: 'highFive', icon: BsStarFill, color: '#facc15', target: 2, xp: 60,
        measure: ctx => ctx.reviews.filter(r => Number(r.rating) === 5).length,
        cta: '/review',
    },
    {
        id: 'finisher', icon: BsTrophyFill, color: '#fb923c', target: 2, xp: 150,
        measure: ctx => ctx.library.filter(item => item.status === 'completed'
            && inMonth(libDate(item, 'completedAt', 'updatedAt'), ctx.monthKey)).length,
        cta: '/library',
    },
    {
        id: 'freshStart', icon: BsController, color: '#34d399', target: 3, xp: 90,
        measure: ctx => ctx.library.filter(item => (item.startedAt ? inMonth(item.startedAt, ctx.monthKey)
            : item.status === 'playing' && inMonth(libDate(item, 'updatedAt', 'addedAt', 'createdAt'), ctx.monthKey))).length,
        cta: '/library',
    },
    {
        id: 'curator', icon: BsCollectionFill, color: '#38bdf8', target: 10, xp: 70,
        measure: ctx => ctx.library.filter(item => inMonth(libDate(item, 'updatedAt', 'addedAt', 'createdAt'), ctx.monthKey)).length,
        cta: '/library',
    },
    {
        id: 'squadUp', icon: BsPeopleFill, color: '#f472b6', target: 1, xp: 80,
        measure: ctx => ctx.lfgPosts,
        cta: '/lfg',
    },
    {
        id: 'socialButterfly', icon: BsPersonPlusFill, color: '#818cf8', target: 3, xp: 60,
        measure: ctx => ctx.followsMade,
        cta: '/leaderboard',
    },
    {
        id: 'collector', icon: BsHeartFill, color: '#e879f9', target: 10, xp: 60,
        measure: ctx => ctx.favorites,
        cta: '/discover',
    },
    {
        id: 'onFire', icon: BsFire, color: '#f97316', target: 7, xp: 100,
        measure: ctx => ctx.streak,
        cta: null,
    },
];

export const challengeById = id => POOL.find(c => c.id === id) || null;

function hashString(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Same 4-5 challenges for everyone in a given month. */
export function challengesForMonth(monthKey) {
    const seed = hashString(`gdh-challenges-${monthKey}`);
    const random = mulberry32(seed);
    const list = [...POOL];
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 4 + (seed % 2));
}

/* ---------- Progress ---------- */

function currentStreak(profile, now = new Date()) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return [dateKey(now), dateKey(yesterday)].includes(profile?.lastActiveDate) ? Number(profile?.streak) || 0 : 0;
}

/** Everything the measure() functions need, for the signed-in user. Failed sources count as 0. */
export async function loadChallengeContext(user, profile, monthKey = monthKeyOf()) {
    const uid = user.uid;
    const countThisMonth = snap => snap.docs.filter(d => inMonth(d.data().createdAt, monthKey)).length;

    const [reviews, library, favorites, lfgPosts, followsMade] = await Promise.allSettled([
        loadUserReviews(uid),
        firestore().then(async ({ db, collection, getDocs }) => {
            const snap = await getDocs(collection(db, 'users', uid, 'library'));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }),
        apiGet(`/getFav?userId=${encodeURIComponent(uid)}`),
        firestore().then(async ({ db, collection, query, where, getDocs }) =>
            countThisMonth(await getDocs(query(collection(db, 'lfgPosts'), where('uid', '==', uid))))),
        firestore().then(async ({ db, collection, query, where, getDocs }) =>
            countThisMonth(await getDocs(query(collection(db, 'follows'), where('follower', '==', uid))))),
    ]);

    const value = (result, fallback) => (result.status === 'fulfilled' ? result.value : fallback);
    return {
        monthKey,
        reviews: value(reviews, []).filter(r => inMonth(reviewDate(r), monthKey)),
        library: value(library, []),
        favorites: Array.isArray(value(favorites, null)) ? favorites.value.length : 0,
        lfgPosts: value(lfgPosts, 0),
        followsMade: value(followsMade, 0),
        streak: currentStreak(profile),
    };
}

export const isClaimed = (profile, id, monthKey) =>
    (profile?.challengeBadges || []).some(b => b.id === id && b.month === monthKey);

/** Adds the badge to users/{uid}.challengeBadges and posts a 'challenge' activity. Returns the new list. */
export async function claimChallengeBadge(user, profile, challenge, monthKey) {
    if (!user?.uid || isClaimed(profile, challenge.id, monthKey)) return profile?.challengeBadges || [];
    const badge = { id: challenge.id, month: monthKey, earnedAt: Date.now() };
    const existing = Array.isArray(profile?.challengeBadges) ? profile.challengeBadges : [];
    const { db, doc, setDoc, updateDoc, arrayUnion } = await firestore();
    const ref = doc(db, 'users', user.uid);
    let next;
    if (existing.length < MAX_CHALLENGE_BADGES) {
        next = [...existing, badge];
        await updateDoc(ref, { challengeBadges: arrayUnion(badge) }).catch(error => {
            if (error?.code !== 'not-found') throw error;
            return setDoc(ref, { challengeBadges: next }, { merge: true });
        });
    } else {
        next = [...existing].sort((a, b) => (a.earnedAt || 0) - (b.earnedAt || 0)).slice(-(MAX_CHALLENGE_BADGES - 1)).concat(badge);
        await setDoc(ref, { challengeBadges: next }, { merge: true });
    }
    postActivity(user, profile, { type: 'challenge', text: challenge.id, url: '/challenges' });
    return next;
}

/** Bonus XP from claimed challenge badges (lets the profile page add it to the XP total). */
export function challengeBadgesXp(profile) {
    return (profile?.challengeBadges || []).reduce((sum, b) => sum + (challengeById(b.id)?.xp || 0), 0);
}
