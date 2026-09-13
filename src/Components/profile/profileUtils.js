import { FaPenNib, FaFeatherAlt, FaHeart, FaGem, FaFire, FaCalendarCheck, FaMedal, FaPalette, FaBookOpen, FaStar, FaCrown, FaBolt } from 'react-icons/fa';

/* ---------- Accent colors ---------- */

export const ACCENTS = {
    violet: { label: 'Violet', from: '#8b5cf6', to: '#06b6d4' },
    crimson: { label: 'Crimson', from: '#f43f5e', to: '#f97316' },
    gold: { label: 'Gold', from: '#f59e0b', to: '#facc15' },
    emerald: { label: 'Emerald', from: '#10b981', to: '#84cc16' },
    ocean: { label: 'Ocean', from: '#3b82f6', to: '#22d3ee' },
    sakura: { label: 'Sakura', from: '#ec4899', to: '#a855f7' },
};

export function getAccent(key) {
    return ACCENTS[key] || ACCENTS.violet;
}

/* ---------- Banner presets (used when no custom cover is uploaded) ---------- */

export const BANNER_PRESETS = {
    nebula: 'radial-gradient(circle at 20% 30%, #7c3aed 0%, transparent 45%), radial-gradient(circle at 80% 60%, #0891b2 0%, transparent 50%), linear-gradient(135deg, #0f0a1f, #111827)',
    inferno: 'radial-gradient(circle at 70% 20%, #f97316 0%, transparent 45%), radial-gradient(circle at 20% 80%, #be123c 0%, transparent 50%), linear-gradient(135deg, #1a0707, #0b0b0f)',
    toxic: 'radial-gradient(circle at 30% 40%, #16a34a 0%, transparent 45%), radial-gradient(circle at 85% 70%, #65a30d 0%, transparent 45%), linear-gradient(135deg, #04130a, #0a0a0a)',
    arctic: 'radial-gradient(circle at 25% 25%, #38bdf8 0%, transparent 45%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%), linear-gradient(135deg, #06101f, #0b1120)',
    synthwave: 'linear-gradient(180deg, #1e0b3a 0%, #7e22ce 55%, #f472b6 100%)',
    midnight: 'linear-gradient(135deg, #020617 0%, #1e293b 50%, #020617 100%)',
};

export function bannerBackground(profile) {
    if (profile?.banner) return undefined;
    return BANNER_PRESETS[profile?.bannerPreset] || BANNER_PRESETS.nebula;
}

/* ---------- Gaming preferences ---------- */

export const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'];

export const GENRES = ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy', 'Horror', 'Racing', 'Sports', 'Simulation', 'Indie', 'MMO', 'Battle Royale', 'Puzzle', 'Fighting'];

export const MAX_GENRES = 5;
export const BIO_MAX = 180;

/* ---------- Levels & XP ---------- */

export const XP_RULES = [
    { key: 'review', label: 'Write a review', xp: 60 },
    { key: 'longReview', label: 'Detailed review (200+ chars)', xp: 40 },
    { key: 'favorite', label: 'Add a favorite game', xp: 15 },
    { key: 'activeDay', label: 'Visit on a new day', xp: 10 },
    { key: 'streak', label: 'Each day of your best streak', xp: 5 },
    { key: 'profile', label: 'Complete your profile', xp: 175 },
];

const TIERS = [
    { minLevel: 1, name: 'Rookie', color: '#9ca3af' },
    { minLevel: 3, name: 'Casual', color: '#34d399' },
    { minLevel: 5, name: 'Gamer', color: '#38bdf8' },
    { minLevel: 8, name: 'Veteran', color: '#a78bfa' },
    { minLevel: 12, name: 'Elite', color: '#f472b6' },
    { minLevel: 17, name: 'Master', color: '#fb923c' },
    { minLevel: 25, name: 'Legend', color: '#facc15' },
];

// Total XP needed to reach a level: 0, 100, 300, 600, 1000, ...
export function xpForLevel(level) {
    return 50 * level * (level - 1);
}

export function getTier(level) {
    return [...TIERS].reverse().find(t => level >= t.minLevel);
}

export function getNextTier(level) {
    return TIERS.find(t => t.minLevel > level) || null;
}

export function computeXp({ profile, reviews, favorites, memberDays }) {
    const longReviews = reviews.filter(r => (r.review || '').length >= 200).length;
    const profileXp =
        (profile.avatar ? 50 : 0) +
        (profile.banner ? 50 : 0) +
        (profile.bio ? 50 : 0) +
        (profile.platforms?.length ? 25 : 0);

    return (
        reviews.length * 60 +
        longReviews * 40 +
        favorites.length * 15 +
        (profile.activeDays || 0) * 10 +
        (profile.bestStreak || 0) * 5 +
        profileXp +
        Math.min(memberDays, 365)
    );
}

export function getLevelInfo(xp) {
    let level = 1;
    while (xp >= xpForLevel(level + 1)) level++;
    const current = xpForLevel(level);
    const next = xpForLevel(level + 1);
    return {
        level,
        xp,
        intoLevel: xp - current,
        levelSpan: next - current,
        toNext: next - xp,
        progress: (xp - current) / (next - current),
        tier: getTier(level),
        nextTier: getNextTier(level),
    };
}

/* ---------- Badges ---------- */

export const BADGES = [
    { id: 'first_review', name: 'First Words', desc: 'Write your first review', icon: FaPenNib, color: '#a78bfa', progress: s => [s.reviews, 1] },
    { id: 'critic', name: 'Critic', desc: 'Write 10 reviews', icon: FaFeatherAlt, color: '#818cf8', progress: s => [s.reviews, 10] },
    { id: 'wordsmith', name: 'Wordsmith', desc: 'Write a review with 300+ characters', icon: FaBookOpen, color: '#22d3ee', progress: s => [s.longestReview, 300] },
    { id: 'five_star', name: 'Hype Machine', desc: 'Give 5 five-star ratings', icon: FaStar, color: '#facc15', progress: s => [s.fiveStars, 5] },
    { id: 'collector', name: 'Collector', desc: 'Add 10 favorite games', icon: FaHeart, color: '#f472b6', progress: s => [s.favorites, 10] },
    { id: 'hoarder', name: 'Treasure Hoarder', desc: 'Add 25 favorite games', icon: FaGem, color: '#e879f9', progress: s => [s.favorites, 25] },
    { id: 'streak_7', name: 'On Fire', desc: 'Reach a 7 day streak', icon: FaFire, color: '#fb923c', progress: s => [s.bestStreak, 7] },
    { id: 'regular', name: 'Regular', desc: 'Be active on 30 different days', icon: FaCalendarCheck, color: '#34d399', progress: s => [s.activeDays, 30] },
    { id: 'stylist', name: 'Stylist', desc: 'Upload a profile picture and a cover', icon: FaPalette, color: '#f43f5e', progress: s => [s.styled, 2] },
    { id: 'veteran', name: 'Old Guard', desc: 'Be a member for one year', icon: FaMedal, color: '#94a3b8', progress: s => [s.memberDays, 365] },
    { id: 'level_10', name: 'Double Digits', desc: 'Reach level 10', icon: FaBolt, color: '#38bdf8', progress: s => [s.level, 10] },
    { id: 'legend', name: 'Legend', desc: 'Reach level 25', icon: FaCrown, color: '#fde047', progress: s => [s.level, 25] },
];

export function evaluateBadges(stats) {
    return BADGES.map(badge => {
        const [current, target] = badge.progress(stats);
        return { ...badge, current: Math.min(current, target), target, unlocked: current >= target };
    });
}

/* ---------- Dates & streak ---------- */

export function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Returns the fields to merge into the user doc when the user shows up on a new day, or null.
export function nextStreakFields(data, now = new Date()) {
    const today = dateKey(now);
    if (data?.lastActiveDate === today) return null;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const streak = data?.lastActiveDate === dateKey(yesterday) ? (data.streak || 0) + 1 : 1;

    return {
        lastActiveDate: today,
        streak,
        bestStreak: Math.max(data?.bestStreak || 0, streak),
        activeDays: (data?.activeDays || 0) + 1,
    };
}

/* ---------- Image processing ---------- */

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image.')); };
        img.src = url;
    });
}

/**
 * Center-crops an image to the given aspect ratio, scales it down and encodes it
 * as a compressed data URL small enough to live inside a Firestore document.
 */
export async function processImage(file, { width, aspect, maxBytes }) {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image is too large (max 10 MB).');

    const img = await loadImage(file);
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (sw / sh > aspect) {
        const w = sh * aspect;
        sx = (sw - w) / 2;
        sw = w;
    } else {
        const h = sw / aspect;
        sy = (sh - h) / 2;
        sh = h;
    }

    const outW = Math.min(width, Math.round(sw));
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
    const type = supportsWebp ? 'image/webp' : 'image/jpeg';

    // Data URL length ~= bytes stored in Firestore
    for (let quality = 0.9; quality >= 0.4; quality -= 0.1) {
        const dataUrl = canvas.toDataURL(type, quality);
        if (dataUrl.length <= maxBytes) return dataUrl;
    }
    throw new Error('Image could not be compressed enough. Try a smaller one.');
}

export const AVATAR_OPTIONS = { width: 400, aspect: 1, maxBytes: 150_000 };
export const BANNER_OPTIONS = { width: 1600, aspect: 16 / 5, maxBytes: 600_000 };
