import { describe, test, expect } from 'vitest';
import {
    TAGS, signalWeight, collectSignals, selectInputs, computeIdf, tagVector, dot, buildTaste, seedTags, recommend, becauseOf, teaserSnapshot,
} from '../src/recommendations/recoEngine.js';

// Tag ids (Steam): roguelike action, rogue-lite, hack and slash, souls-like, difficult, pixel graphics, farming sim, cozy, FPS, PvP, story rich
const T = { actionRogue: 42804, rogueLite: 3959, hackSlash: 1646, soulsLike: 29482, difficult: 4026, pixel: 3964, farming: 87918, cozy: 97376, fps: 1663, pvp: 1775, story: 1742 };

const app = (appid, name, tags, extra = {}) => ({
    appid, name, image: `https://img/${appid}.jpg`, type: 0, tags, tagWeights: tags.map((_, i) => 1000 - i * 60),
    reviewPct: 92, reviewCount: 20000, isFree: false, comingSoon: false, earlyAccess: false, price: null, ...extra,
});

const APPS = [
    app(1, 'Hades', [T.actionRogue, T.rogueLite, T.hackSlash, T.difficult, T.story]),
    app(2, 'Dead Cells', [T.actionRogue, T.rogueLite, T.pixel, T.difficult, T.hackSlash]),
    app(3, 'Hollow Knight', [T.soulsLike, T.difficult, T.pixel, T.story]),
    app(4, 'Stardew Valley', [T.farming, T.cozy, T.pixel]),
    app(5, 'Counter-Strike', [T.fps, T.pvp]),
    // candidates
    app(10, 'Skul', [T.actionRogue, T.rogueLite, T.pixel, T.hackSlash, T.difficult], { price: { final: 8.39, initial: 16.79, discount: 50, formatted: '8,39€' } }),
    app(11, 'Cozy Farm', [T.farming, T.cozy, T.pixel], { price: { final: 5, initial: 20, discount: 75, formatted: '5€' } }),
    app(12, 'Tactical Shooter', [T.fps, T.pvp]),
    app(13, 'Blasphemous', [T.soulsLike, T.difficult, T.pixel, T.hackSlash]),
    app(14, 'Bad Roguelite', [T.actionRogue, T.rogueLite, T.hackSlash], { reviewPct: 40 }),
    app(15, 'Upcoming Rogue', [T.actionRogue, T.rogueLite], { comingSoon: true }),
    app(16, 'Wishlisted Rogue', [T.actionRogue, T.rogueLite, T.difficult], { price: { final: 10, initial: 20, discount: 50, formatted: '10€' } }),
];
const appMap = () => new Map(APPS.map(a => [a.appid, a]));

const LIBRARY = [
    { gameKey: 'steam-1', name: 'Hades', status: 'completed', steamPlaytimeHours: 300, rating: 5 },
    { gameKey: 'steam-2', name: 'Dead Cells', status: 'playing', steamPlaytimeHours: 60 },
    { gameKey: 'steam-3', name: 'Hollow Knight', status: 'completed', playtimeHours: 40, rating: 4 },
    { gameKey: 'steam-4', name: 'Stardew Valley', status: 'dropped', steamPlaytimeHours: 1.5, rating: 2 },
    { gameKey: 'steam-5', name: 'Counter-Strike', status: 'dropped', steamPlaytimeHours: 2 },
    { gameKey: 'steam-16', name: 'Wishlisted Rogue', status: 'wishlist' },
    { gameKey: 'steam-13', name: 'Blasphemous', status: 'backlog', steamPlaytimeHours: 0 },
];

describe('signalWeight', () => {
    test('more hours weigh more, on a log scale', () => {
        const few = signalWeight({ hours: 2 }, 30);
        const many = signalWeight({ hours: 30 }, 30);
        const huge = signalWeight({ hours: 3000 }, 30);
        expect(many).toBeGreaterThan(few);
        expect(huge).toBeLessThanOrEqual(1.8); // capped
    });

    test('a low rating is negative no matter the hours', () => {
        expect(signalWeight({ hours: 200, rating: 1 }, 30)).toBeLessThan(0);
        expect(signalWeight({ hours: 200, rating: 2, status: 'completed' }, 30)).toBeLessThan(0);
    });

    test('dropped quickly is negative, finished perfect is strongly positive', () => {
        expect(signalWeight({ hours: 1, status: 'dropped' }, 30)).toBeLessThan(0);
        const perfect = signalWeight({ hours: 20, status: 'completed', achievement: { unlocked: 50, total: 50 } }, 30);
        expect(perfect).toBeGreaterThan(signalWeight({ hours: 20, status: 'completed' }, 30));
    });

    test('console achievements without playtime still count as played', () => {
        expect(signalWeight({ hours: 0, achievement: { unlocked: 10, total: 40 } }, 30)).toBeGreaterThan(0);
        expect(signalWeight({ hours: 0, status: 'backlog' }, 30)).toBe(0);
    });
});

describe('collectSignals / selectInputs', () => {
    test('merges achievements into library entries and adds achievement-only games', () => {
        const signals = collectSignals(LIBRARY, [
            { gameKey: 'steam-1', name: 'Hades', unlocked: 49, total: 49, perfect: true },
            { gameKey: 'psn-NPWR1', name: 'God of War', unlocked: 30, total: 37 },
        ]);
        expect(signals.find(s => s.key === 'steam-1').achievement.perfect).toBe(true);
        expect(signals.find(s => s.key === 'psn-NPWR1').weight).toBeGreaterThan(0);
    });

    test('asks for Steam appids of signals and backlog, and titles of console games', () => {
        const signals = collectSignals(LIBRARY, [{ gameKey: 'psn-NPWR1', name: 'God of War', unlocked: 30, total: 37 }]);
        const { appids, names } = selectInputs(signals, [99]);
        expect(appids).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 13, 16, 99]));
        expect(names).toEqual([{ key: 'psn-NPWR1', name: 'God of War' }]);
    });
});

describe('vectors', () => {
    test('identical tag lists are fully similar, disjoint ones not at all', () => {
        const idf = computeIdf(APPS);
        const hades = tagVector(APPS[0], idf);
        expect(dot(hades, tagVector(APPS[0], idf))).toBeCloseTo(1, 5);
        expect(dot(hades, tagVector(APPS[4], idf))).toBe(0);
    });

    test('neutral tags are ignored', () => {
        const vec = tagVector(app(1, 'x', [TAGS.freeToPlay, T.fps]), null);
        expect(vec.has(TAGS.freeToPlay)).toBe(false);
        expect(vec.get(T.fps)).toBeCloseTo(1, 5);
    });
});

describe('buildTaste', () => {
    const signals = collectSignals(LIBRARY);
    const apps = appMap();
    const taste = buildTaste(signals, apps, new Map(), computeIdf(APPS));

    test('needs three liked games', () => {
        expect(taste.ready).toBe(true);
        expect(buildTaste(collectSignals(LIBRARY.slice(0, 2)), apps, new Map(), computeIdf(APPS)).ready).toBe(false);
    });

    test('top tags come from liked games, dropped games go to the dislike profile', () => {
        const top = taste.topTags.slice(0, 3).map(t => t.tag);
        expect(top).toEqual(expect.arrayContaining([T.actionRogue]));
        expect(taste.negative.has(T.farming)).toBe(true);
        expect(taste.positive.has(T.farming)).toBe(false);
    });

    test('reads difficulty, play style and typical length', () => {
        expect(taste.difficulty).toBe('challenge');
        expect(taste.playStyle).toBe('singleplayer');
        expect(taste.typicalLength).toBeNull(); // only 2 completed games
    });

    test('seed tags skip broad tags', () => {
        const seeds = seedTags(signals, apps, new Map());
        expect(seeds).toContain(T.actionRogue);
        expect(seeds).not.toContain(TAGS.indie);
    });
});

describe('recommend', () => {
    const result = recommend({
        items: LIBRARY,
        apps: appMap(),
        candidates: new Set([10, 11, 12, 13, 14, 15, 1]),
        hidden: [],
    });

    test('ranks the closest unowned game first and explains it with the strongest liked game', () => {
        expect(result.picks[0].appid).toBe(10);
        expect(result.picks[0].match).toBeGreaterThan(60);
        expect(result.picks[0].because.kind).toBe('rated');
        expect(result.picks[0].because.name).toBe('Hades');
        expect(result.picks[0].sharedTags).toContain(T.actionRogue);
    });

    test('never recommends owned, upcoming, badly reviewed or disliked kinds of games', () => {
        const ids = result.picks.map(p => p.appid);
        expect(ids).not.toContain(1); // owned
        expect(ids).not.toContain(13); // in the backlog = owned
        expect(ids).not.toContain(15); // coming soon
        expect(ids).not.toContain(14); // 40% reviews
        expect(ids).not.toContain(11); // only similar to a dropped game
        expect(ids).not.toContain(12);
    });

    test('deals include wishlisted games on sale', () => {
        const deal = result.deals.find(d => d.appid === 16);
        expect(deal).toBeTruthy();
        expect(deal.onWishlist).toBe(true);
        expect(result.deals.map(d => d.appid)).not.toContain(11);
    });

    test('backlog suggests an owned game that fits, and flags short games', () => {
        expect(result.backlog[0].appid).toBe(13);
        expect(result.backlog[0].short).toBe(false);
        const apps = appMap();
        apps.set(13, { ...apps.get(13), tags: [...apps.get(13).tags, TAGS.short] });
        expect(recommend({ items: LIBRARY, apps, candidates: new Set([10]) }).backlog[0].short).toBe(true);
    });

    test('hidden games disappear and count against similar games', () => {
        const hidden = recommend({ items: LIBRARY, apps: appMap(), candidates: new Set([10, 13]), hidden: [10] });
        expect(hidden.picks.map(p => p.appid)).not.toContain(10);
        expect(hidden.taste.disliked.some(s => s.appid === 10)).toBe(true);
    });

    test('non-Steam library games are matched through keyToAppid', () => {
        const items = LIBRARY.map(item => (item.gameKey === 'steam-1' ? { ...item, gameKey: 'psn-HADES' } : item));
        const matched = recommend({ items, apps: appMap(), keyToAppid: new Map([['psn-HADES', 1]]), candidates: new Set([1, 10]) });
        expect(matched.picks.map(p => p.appid)).not.toContain(1);
        expect(matched.picks[0].because.name).toBe('Hades');
    });

    test('empty library -> not ready, no picks', () => {
        const none = recommend({ items: [], apps: appMap(), candidates: new Set([10]) });
        expect(none.taste.ready).toBe(false);
        expect(none.picks).toEqual([]);
    });

    test('teaser snapshot is small', () => {
        const snap = teaserSnapshot(result);
        expect(snap.length).toBeLessThanOrEqual(4);
        expect(Object.keys(snap[0])).toEqual(['appid', 'name', 'image', 'match', 'because', 'discount']);
    });
});

describe('becauseOf', () => {
    test('picks the strongest fact', () => {
        expect(becauseOf({ key: 'a', name: 'A', hours: 300 }).kind).toBe('hours');
        expect(becauseOf({ key: 'a', name: 'A', hours: 3, status: 'completed' }).kind).toBe('completed');
        expect(becauseOf({ key: 'a', name: 'A', hours: 5, achievement: { unlocked: 5, total: 5 } }).kind).toBe('perfect');
        expect(becauseOf({ key: 'a', name: 'A', hours: 0, status: 'wishlist' }).kind).toBe('wishlisted');
    });
});
