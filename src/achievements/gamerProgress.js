// Levels, XP and badges earned by playing: synced achievements (users/{uid}.achievementStats)
// and playtime imported from Steam / PlayStation (library steamPlaytimeHours, users/{uid}.platformSync.steam.totalHours).
// Hand-entered hours don't count, so these can't be typed in.
import {
    FaAward, FaBullseye, FaCheckDouble, FaClock, FaCrown, FaDragon, FaGem, FaHourglassHalf, FaLayerGroup,
    FaMedal, FaSkull, FaStar, FaStopwatch, FaTrophy, FaXbox, FaPlaystation,
} from 'react-icons/fa';
import { getNextTier, getTier } from '../Components/profile/profileUtils.js';

export const PSN_TROPHY_COLORS = { platinum: '#a5b4fc', gold: '#fbbf24', silver: '#cbd5e1', bronze: '#d97706' };

/** Rarity bucket of a global unlock rate (percent). */
export function rarityTier(rarity) {
    if (rarity == null) return null;
    if (rarity < 1) return { key: 'legendary', color: '#f59e0b' };
    if (rarity < 5) return { key: 'epic', color: '#c084fc' };
    if (rarity < 10) return { key: 'rare', color: '#38bdf8' };
    if (rarity < 30) return { key: 'uncommon', color: '#34d399' };
    return { key: 'common', color: '#9ca3af' };
}

/* ───────── Level curves ───────── */

/** value needed for a level: base * L * (L - 1)  (base 10: 0, 20, 60, 120, 200 ...) */
export function curveLevel(value, base) {
    const v = Math.max(0, Number(value) || 0);
    let level = 1;
    while (v >= base * (level + 1) * level) level++;
    const current = base * level * (level - 1);
    const next = base * (level + 1) * level;
    return {
        level,
        value: v,
        intoLevel: v - current,
        levelSpan: next - current,
        toNext: next - v,
        progress: (v - current) / (next - current),
        tier: getTier(level),
        nextTier: getNextTier(level),
    };
}

export const hunterLevel = points => curveLevel(points, 10); // 1000 points ≈ level 10
export const playtimeLevel = hours => curveLevel(hours, 5); // 500 h ≈ level 10

/* ───────── Stats from the profile + library ───────── */

/**
 * @param {object} profile users/{uid} data (achievementStats, platformSync)
 * @param {Array} libraryItems users/{uid}/library docs (optional)
 */
export function gamerStats(profile, libraryItems = []) {
    const a = profile?.achievementStats || {};
    const sync = profile?.platformSync || {};
    let steamLibraryHours = 0;
    let otherHours = 0;
    let maxGameHours = 0;
    for (const item of libraryItems) {
        const hours = Number(item.steamPlaytimeHours);
        if (!Number.isFinite(hours) || hours <= 0) continue;
        if (item.source === 'steam') steamLibraryHours += hours;
        else otherHours += hours;
        maxGameHours = Math.max(maxGameHours, hours);
    }
    // The Steam sync knows the playtime of the whole Steam account, the library only of imported games
    const steamHours = Math.max(steamLibraryHours, Number(sync.steam?.totalHours) || 0);
    const connected = ['steam', 'xbox', 'psn'].filter(p => sync[p]?.lastSyncAt || a.byPlatform?.[p]?.total).length;
    return {
        achievements: a.unlocked || 0,
        achievementsTotal: a.total || 0,
        perfectGames: a.perfect || 0,
        rareAchievements: a.rare || 0,
        ultraRareAchievements: a.ultraRare || 0,
        hunterPoints: a.hunterPoints || 0,
        gamerscore: a.gamerscore || 0,
        platinums: a.trophies?.platinum || 0,
        hoursPlayed: Math.round(steamHours + otherHours),
        maxGameHours: Math.round(maxGameHours),
        platformsSynced: connected,
    };
}

/* ───────── XP for the site level ───────── */

export const GAMER_XP_RULES = [
    { key: 'achievementPoint', xp: 2 },
    { key: 'hourPlayed', xp: 2 },
];

/** 2 XP per achievement point (rarer achievements give more points), 2 XP per hour up to 500 h then 0.5. */
export function gamerXp(stats) {
    const hours = stats.hoursPlayed || 0;
    const hoursXp = Math.min(hours, 500) * 2 + Math.max(0, hours - 500) * 0.5;
    return Math.round((stats.hunterPoints || 0) * 2 + hoursXp);
}

/* ───────── Badges (same shape as profileUtils BADGES) ───────── */

export const GAMER_BADGES = [
    { id: 'ach_first', icon: FaTrophy, color: '#fbbf24', progress: s => [s.achievements, 1] },
    { id: 'ach_100', icon: FaMedal, color: '#f59e0b', progress: s => [s.achievements, 100] },
    { id: 'ach_1000', icon: FaAward, color: '#fb923c', progress: s => [s.achievements, 1000] },
    { id: 'ach_5000', icon: FaCrown, color: '#facc15', progress: s => [s.achievements, 5000] },
    { id: 'perfect_1', icon: FaCheckDouble, color: '#34d399', progress: s => [s.perfectGames, 1] },
    { id: 'perfect_10', icon: FaStar, color: '#10b981', progress: s => [s.perfectGames, 10] },
    { id: 'perfect_50', icon: FaDragon, color: '#059669', progress: s => [s.perfectGames, 50] },
    { id: 'rare_10', icon: FaGem, color: '#38bdf8', progress: s => [s.rareAchievements, 10] },
    { id: 'ultra_rare', icon: FaBullseye, color: '#f472b6', progress: s => [s.ultraRareAchievements, 1] },
    { id: 'platinum_1', icon: FaPlaystation, color: '#a5b4fc', progress: s => [s.platinums, 1] },
    { id: 'platinum_10', icon: FaPlaystation, color: '#818cf8', progress: s => [s.platinums, 10] },
    { id: 'gamerscore_10k', icon: FaXbox, color: '#22c55e', progress: s => [s.gamerscore, 10000] },
    { id: 'hours_100', icon: FaClock, color: '#a78bfa', progress: s => [s.hoursPlayed, 100] },
    { id: 'hours_1000', icon: FaHourglassHalf, color: '#8b5cf6', progress: s => [s.hoursPlayed, 1000] },
    { id: 'hours_5000', icon: FaStopwatch, color: '#7c3aed', progress: s => [s.hoursPlayed, 5000] },
    { id: 'one_game_100', icon: FaBullseye, color: '#fb7185', progress: s => [s.maxGameHours, 100] },
    { id: 'one_game_1000', icon: FaSkull, color: '#e11d48', progress: s => [s.maxGameHours, 1000] },
    { id: 'triple_threat', icon: FaLayerGroup, color: '#22d3ee', progress: s => [s.platformsSynced, 3] },
];

export function evaluateGamerBadges(stats) {
    return GAMER_BADGES.map(badge => {
        const [current, target] = badge.progress(stats);
        const value = Number(current) || 0;
        return { ...badge, current: Math.min(value, target), target, unlocked: value >= target };
    });
}
