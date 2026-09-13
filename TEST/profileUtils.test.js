import { describe, test, expect } from 'vitest';
import {
    ACCENTS, getAccent, BANNER_PRESETS, bannerBackground,
    xpForLevel, getTier, getNextTier, computeXp, getLevelInfo,
    BADGES, evaluateBadges, dateKey, nextStreakFields, processImage,
} from '../src/Components/profile/profileUtils.js';

describe('getAccent', () => {
    test('returns the requested accent', () => {
        expect(getAccent('gold')).toBe(ACCENTS.gold);
    });

    test('falls back to violet for unknown or missing keys', () => {
        expect(getAccent('does-not-exist')).toBe(ACCENTS.violet);
        expect(getAccent(undefined)).toBe(ACCENTS.violet);
    });
});

describe('bannerBackground', () => {
    test('uses no gradient when a custom banner is uploaded', () => {
        expect(bannerBackground({ banner: 'data:image/webp;base64,xx' })).toBeUndefined();
    });

    test('uses the chosen preset', () => {
        expect(bannerBackground({ bannerPreset: 'inferno' })).toBe(BANNER_PRESETS.inferno);
    });

    test('defaults to nebula for unknown preset or no profile', () => {
        expect(bannerBackground({ bannerPreset: 'nope' })).toBe(BANNER_PRESETS.nebula);
        expect(bannerBackground(null)).toBe(BANNER_PRESETS.nebula);
    });
});

describe('levels', () => {
    test('xpForLevel follows 50 * L * (L - 1)', () => {
        expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000]);
    });

    test.each([
        [0, 1, 'Rookie'],
        [99, 1, 'Rookie'],
        [100, 2, 'Rookie'],
        [300, 3, 'Casual'],
        [1000, 5, 'Gamer'],
        [2800, 8, 'Veteran'],
    ])('getLevelInfo(%i) -> level %i (%s)', (xp, level, tierName) => {
        const info = getLevelInfo(xp);
        expect(info.level).toBe(level);
        expect(info.tier.name).toBe(tierName);
    });

    test('progress values are consistent', () => {
        const info = getLevelInfo(150); // level 2: 100..300
        expect(info.intoLevel).toBe(50);
        expect(info.levelSpan).toBe(200);
        expect(info.toNext).toBe(150);
        expect(info.progress).toBeCloseTo(0.25);
    });

    test('getTier / getNextTier', () => {
        expect(getTier(12).name).toBe('Elite');
        expect(getNextTier(12).name).toBe('Master');
        expect(getNextTier(30)).toBeNull();
    });
});

describe('computeXp', () => {
    test('empty account only gets member days', () => {
        expect(computeXp({ profile: {}, reviews: [], favorites: [], memberDays: 10 })).toBe(10);
    });

    test('adds every source of XP', () => {
        const xp = computeXp({
            profile: { avatar: 'a', banner: 'b', bio: 'hi', platforms: ['PC'], activeDays: 3, bestStreak: 2 },
            reviews: [{ review: 'short' }, { review: 'x'.repeat(200) }],
            favorites: [{}, {}, {}],
            memberDays: 5,
        });
        // 2*60 + 1*40 + 3*15 + 3*10 + 2*5 + (50+50+50+25) + 5
        expect(xp).toBe(120 + 40 + 45 + 30 + 10 + 175 + 5);
    });

    test('member days are capped at 365', () => {
        expect(computeXp({ profile: {}, reviews: [], favorites: [], memberDays: 5000 })).toBe(365);
    });
});

describe('evaluateBadges', () => {
    const baseStats = { reviews: 0, longestReview: 0, fiveStars: 0, favorites: 0, bestStreak: 0, activeDays: 0, styled: 0, memberDays: 0, level: 1 };

    test('returns one entry per badge, all locked for a new user', () => {
        const badges = evaluateBadges(baseStats);
        expect(badges).toHaveLength(BADGES.length);
        expect(badges.every(b => !b.unlocked)).toBe(true);
    });

    test('unlocks badges when the target is reached and clamps progress', () => {
        const badges = evaluateBadges({ ...baseStats, reviews: 12, favorites: 11 });
        const byId = Object.fromEntries(badges.map(b => [b.id, b]));
        expect(byId.first_review.unlocked).toBe(true);
        expect(byId.critic.unlocked).toBe(true);
        expect(byId.critic.current).toBe(10);
        expect(byId.collector.unlocked).toBe(true);
        expect(byId.hoarder.unlocked).toBe(false);
        expect(byId.hoarder.current).toBe(11);
    });
});

describe('dateKey', () => {
    test('formats as YYYY-MM-DD with zero padding', () => {
        expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
        expect(dateKey(new Date(2026, 10, 25))).toBe('2026-11-25');
    });
});

describe('nextStreakFields', () => {
    const now = new Date(2026, 8, 13, 12, 0, 0);

    test('returns null when already active today', () => {
        expect(nextStreakFields({ lastActiveDate: '2026-09-13', streak: 4 }, now)).toBeNull();
    });

    test('continues the streak when last active yesterday', () => {
        expect(nextStreakFields({ lastActiveDate: '2026-09-12', streak: 4, bestStreak: 4, activeDays: 10 }, now)).toEqual({
            lastActiveDate: '2026-09-13', streak: 5, bestStreak: 5, activeDays: 11,
        });
    });

    test('resets the streak after a gap but keeps the best streak', () => {
        expect(nextStreakFields({ lastActiveDate: '2026-09-01', streak: 9, bestStreak: 9, activeDays: 20 }, now)).toEqual({
            lastActiveDate: '2026-09-13', streak: 1, bestStreak: 9, activeDays: 21,
        });
    });

    test('works for a brand new user (no data)', () => {
        expect(nextStreakFields(undefined, now)).toEqual({
            lastActiveDate: '2026-09-13', streak: 1, bestStreak: 1, activeDays: 1,
        });
    });

    test('handles month boundaries', () => {
        const firstOfOctober = new Date(2026, 9, 1);
        expect(nextStreakFields({ lastActiveDate: '2026-09-30', streak: 2 }, firstOfOctober).streak).toBe(3);
    });
});

describe('processImage validation', () => {
    const options = { width: 400, aspect: 1, maxBytes: 150_000 };

    test('rejects non-image files', async () => {
        const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
        await expect(processImage(file, options)).rejects.toThrow('Please choose an image file.');
    });

    test('rejects images over 10 MB', async () => {
        const file = { type: 'image/png', size: 11 * 1024 * 1024 };
        await expect(processImage(file, options)).rejects.toThrow('Image is too large (max 10 MB).');
    });
});
