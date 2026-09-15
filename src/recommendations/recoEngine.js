// Personal game recommendations: taste profile, scoring and reasons. Pure functions (no React, no network).
//
//   const signals = collectSignals(libraryItems, achievementGames);
//   const { appids, names } = selectInputs(signals);                  // what to ask POST /reco/apps for
//   const tags = seedTags(signals, apps, keyToAppid);                 // tags for GET /reco/candidates
//   const result = recommend({ items, achievements, apps, keyToAppid, candidates, wishlist, hidden });
//     -> { taste, picks, deals, backlog }
//
// apps: Map appid -> app from the backend (routes/recommendations.js):
//   { appid, name, image, type, tags: [tagid] (strongest first), tagWeights, reviewPct, reviewCount, isFree, comingSoon, earlyAccess, price }
//
// How it works
//   * Every game you played, rated, finished, wishlisted or hid is a signal with a weight: hours on a log scale
//     (relative to your own playtimes), star rating, status and achievement completion. Dropped, 1-2 star and hidden games weigh negative.
//   * A game is a vector of its Steam user tags: vote share x rank x a damped IDF, so "Singleplayer" counts less than "Souls-like".
//   * Your taste is the weighted sum of the liked vectors (and a separate one for the disliked).
//     A game's similarity = cosine to the liked profile minus half the cosine to the disliked one.
//   * The reason shown is the liked game that contributes most to that similarity.
import { itemHours } from '../library/libraryApi.js';
import { normalizeTitle } from '../lib/games.js';

export const TAGS = {
    difficult: 4026, soulsLike: 29482, precisionPlatformer: 3877, bulletHell: 4885,
    casual: 597, relaxing: 1654, cozy: 97376, familyFriendly: 5350, wholesome: 552282,
    short: 4234, singleplayer: 4182, multiplayer: 3859, onlineCoop: 3843, coop: 1685, pvp: 1775, mmo: 128, competitive: 3878,
    action: 19, adventure: 21, indie: 492, twoD: 3871, threeD: 4191, colorful: 4305,
    freeToPlay: 113, earlyAccess: 493, greatSoundtrack: 1756, controller: 7481, addictive: 4190, sexualContent: 12095,
};

const HARD_TAGS = new Set([TAGS.difficult, TAGS.soulsLike, TAGS.precisionPlatformer, TAGS.bulletHell]);
const EASY_TAGS = new Set([TAGS.casual, TAGS.relaxing, TAGS.cozy, TAGS.familyFriendly, TAGS.wholesome]);
const MULTI_TAGS = new Set([TAGS.multiplayer, TAGS.onlineCoop, TAGS.coop, TAGS.pvp, TAGS.mmo, TAGS.competitive]);
// Business model / praise: says nothing about the kind of game you like
const NEUTRAL_TAGS = new Set([TAGS.freeToPlay, TAGS.earlyAccess, TAGS.greatSoundtrack, TAGS.controller, TAGS.addictive]);
// Too broad to search by: their top-seller lists are just the overall top sellers
const BROAD_TAGS = new Set([TAGS.action, TAGS.adventure, TAGS.indie, TAGS.singleplayer, TAGS.twoD, TAGS.threeD, TAGS.colorful]);

const RATING_WEIGHT = { 1: -1.2, 2: -0.7, 3: 0.1, 4: 0.9, 5: 1.6 };
const HIDDEN_WEIGHT = -0.8;
const MAX_SIGNAL_APPIDS = 300;
const MAX_BACKLOG_APPIDS = 150;
const MAX_NAMES = 40;
const MAX_TAG_COUNT = 15;
const REASON_MIN_SIMILARITY = 0.4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function appidOf(key, keyToAppid) {
    const match = /^steam-(\d+)$/.exec(String(key || ''));
    if (match) return Number(match[1]);
    return keyToAppid?.get(key) || null;
}

function percentile(values, p) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const isPerfect = achievement => Boolean(achievement?.total > 0 && (achievement.perfect || achievement.unlocked >= achievement.total));

/**
 * How much a game says about your taste. hoursRef = "a lot of hours" for this user (80th percentile of playtimes).
 * entry: { hours, rating, status, achievement: { unlocked, total, perfect } | null }
 */
export function signalWeight(entry, hoursRef = 30) {
    const hours = entry.hours || 0;
    const achievement = entry.achievement;
    const completion = achievement?.total > 0 ? achievement.unlocked / achievement.total : 0;
    let weight = hours > 0 ? Math.min(1.5, Math.log1p(hours) / Math.log1p(hoursRef)) * 1.2 : 0;

    if (entry.status === 'completed') weight += 0.6;
    else if (entry.status === 'playing') weight += 0.35;
    else if (entry.status === 'wishlist') weight += 0.4;
    else if (entry.status === 'dropped') weight -= hours < 5 ? 0.9 : 0.4;

    // Console games often have no playtime, but unlocked achievements show you played
    if (hours <= 0 && achievement?.unlocked > 0) weight += 0.2 + 0.4 * completion;
    if (isPerfect(achievement)) weight += 0.6;
    else if (completion >= 0.5) weight += 0.3;

    const rating = entry.rating;
    if (RATING_WEIGHT[rating] !== undefined) {
        // A low rating wins over any amount of hours
        weight = rating <= 2 ? Math.min(weight, RATING_WEIGHT[rating]) : weight + RATING_WEIGHT[rating];
    }
    if (entry.status === 'hidden') weight = HIDDEN_WEIGHT;
    return Math.round(weight * 1000) / 1000;
}

/** Library items + synced achievement summaries -> signal entries { key, name, image, hours, rating, status, achievement, weight } */
export function collectSignals(items = [], achievements = []) {
    const byKey = new Map();
    for (const item of items) {
        if (!item?.gameKey) continue;
        byKey.set(item.gameKey, {
            key: item.gameKey, name: item.name, image: item.image || null,
            hours: itemHours(item), rating: item.rating || null, status: item.status, achievement: null,
        });
    }
    for (const game of achievements) {
        if (!game?.gameKey) continue;
        const entry = byKey.get(game.gameKey);
        if (entry) entry.achievement = game;
        else byKey.set(game.gameKey, { key: game.gameKey, name: game.name, image: game.image || null, hours: 0, rating: null, status: null, achievement: game });
    }
    const entries = [...byKey.values()];
    const hoursRef = clamp(percentile(entries.map(e => e.hours).filter(h => h > 0), 0.8), 15, 200);
    for (const entry of entries) entry.weight = signalWeight(entry, hoursRef);
    return entries;
}

/**
 * Which store data the recommender needs: Steam appids of the strongest signals and of backlog games,
 * plus titles of non-Steam games (Xbox, PlayStation, GOG, RAWG) to match on Steam.
 */
export function selectInputs(signals, hidden = []) {
    const ranked = [...signals].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
    const signalIds = [];
    const backlogIds = [];
    const names = [];
    for (const entry of ranked) {
        const isBacklog = entry.status === 'backlog';
        if (!entry.weight && !isBacklog) continue;
        const steam = /^steam-(\d+)$/.exec(entry.key)?.[1];
        if (steam) {
            if (entry.weight && signalIds.length < MAX_SIGNAL_APPIDS) signalIds.push(Number(steam));
            else if (isBacklog && backlogIds.length < MAX_BACKLOG_APPIDS) backlogIds.push(Number(steam));
        } else if (entry.name && names.length < MAX_NAMES) {
            names.push({ key: entry.key, name: String(entry.name).slice(0, 120) });
        }
    }
    const appids = [...new Set([...signalIds, ...backlogIds, ...hidden.map(Number)])].filter(Boolean).slice(0, 500);
    return { appids, names };
}

/* ───────── Vectors ───────── */

/** Damped inverse document frequency of every tag in the app list. */
export function computeIdf(appList) {
    const df = new Map();
    let total = 0;
    for (const app of appList) {
        if (!app?.tags?.length) continue;
        total += 1;
        for (const tag of new Set(app.tags)) df.set(tag, (df.get(tag) || 0) + 1);
    }
    const idf = new Map();
    for (const [tag, count] of df) idf.set(tag, 1 + 0.35 * Math.log((total + 1) / (count + 1)));
    return idf;
}

function toUnit(map) {
    let norm = 0;
    for (const value of map.values()) norm += value * value;
    norm = Math.sqrt(norm);
    const unit = new Map();
    if (norm > 0) for (const [key, value] of map) unit.set(key, value / norm);
    return unit;
}

/** Unit-length tag vector of an app (Map tagid -> value). */
export function tagVector(app, idf) {
    const tags = app?.tags || [];
    const weights = app?.tagWeights || [];
    const maxVotes = Math.max(1, ...weights);
    const vec = new Map();
    tags.slice(0, MAX_TAG_COUNT).forEach((tag, index) => {
        if (NEUTRAL_TAGS.has(tag)) return;
        const votes = weights[index] > 0 ? weights[index] / maxVotes : 1;
        vec.set(tag, votes * (1 / (1 + index * 0.06)) * (idf?.get(tag) ?? 1));
    });
    return toUnit(vec);
}

export function dot(a, b) {
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    let sum = 0;
    for (const [key, value] of small) {
        const other = large.get(key);
        if (other) sum += value * other;
    }
    return sum;
}

/* ───────── Taste ───────── */

/** signals + apps -> the taste profile. `ready` needs at least 3 liked games with store data. */
export function buildTaste(signals, apps, keyToAppid, idf) {
    const byAppid = new Map();
    for (const signal of signals) {
        if (!signal.weight) continue;
        const appid = appidOf(signal.key, keyToAppid);
        const app = appid ? apps.get(appid) : null;
        if (!app?.tags?.length) continue;
        const previous = byAppid.get(appid);
        // Same game on two platforms: keep the stronger signal
        if (!previous || Math.abs(signal.weight) > Math.abs(previous.weight)) byAppid.set(appid, { ...signal, appid, app });
    }

    const liked = [];
    const disliked = [];
    const likedRaw = new Map();
    const dislikedRaw = new Map();
    for (const signal of byAppid.values()) {
        signal.vec = tagVector(signal.app, idf);
        const [list, raw] = signal.weight > 0 ? [liked, likedRaw] : [disliked, dislikedRaw];
        list.push(signal);
        for (const [tag, value] of signal.vec) raw.set(tag, (raw.get(tag) || 0) + Math.abs(signal.weight) * value);
    }
    liked.sort((a, b) => b.weight - a.weight);
    const positive = toUnit(likedRaw);
    const negative = toUnit(dislikedRaw);

    // "100% match" = as close to your taste as your own favourites are
    const favourites = liked.slice(0, 5);
    const reference = favourites.length
        ? Math.max(0.3, favourites.reduce((sum, s) => sum + dot(s.vec, positive), 0) / favourites.length)
        : 0.5;

    const likedWeight = liked.reduce((sum, s) => sum + s.weight, 0) || 1;
    const share = set => liked.reduce((sum, s) => sum + (s.app.tags.some(tag => set.has(tag)) ? s.weight : 0), 0) / likedWeight;
    const hardShare = share(HARD_TAGS);
    const easyShare = share(EASY_TAGS);
    const multiShare = share(MULTI_TAGS);

    const topTagsRaw = [...likedRaw].filter(([tag]) => !BROAD_TAGS.has(tag)).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const strongest = topTagsRaw[0]?.[1] || 1;
    const completedHours = signals.filter(s => s.status === 'completed' && s.hours >= 0.5).map(s => s.hours);

    return {
        ready: liked.length >= 3,
        liked,
        disliked,
        positive,
        negative,
        reference,
        topTags: topTagsRaw.map(([tag, value]) => ({ tag, strength: Math.round((value / strongest) * 100) / 100 })),
        hardShare,
        easyShare,
        multiShare,
        difficulty: hardShare >= 0.3 && hardShare > easyShare ? 'challenge' : easyShare >= 0.3 && easyShare > hardShare ? 'relaxed' : 'balanced',
        playStyle: multiShare >= 0.55 ? 'multiplayer' : multiShare <= 0.25 ? 'singleplayer' : 'mixed',
        typicalLength: completedHours.length >= 3 ? Math.round(median(completedHours)) : null,
        completedCount: completedHours.length,
        signalCount: byAppid.size,
    };
}

/** Tags to fetch candidates for: the strongest specific tags of a taste built from library games only. */
export function seedTags(signals, apps, keyToAppid, count = 8) {
    const idf = computeIdf([...apps.values()]);
    const taste = buildTaste(signals, apps, keyToAppid, idf);
    if (!taste.ready) return [];
    return [...taste.positive]
        .filter(([tag]) => !BROAD_TAGS.has(tag))
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([tag]) => tag);
}

/* ───────── Scoring ───────── */

export function scoreApp(app, taste, idf) {
    const vec = tagVector(app, idf);
    const like = dot(vec, taste.positive);
    const dislike = taste.negative.size ? dot(vec, taste.negative) : 0;
    const similarity = like - 0.5 * dislike;
    const hasReviews = app.reviewCount >= 30 && typeof app.reviewPct === 'number';
    const quality = hasReviews ? clamp((app.reviewPct - 55) / 40, 0, 1) : 0.35;
    const confidence = clamp(Math.log10((app.reviewCount || 0) + 1) / 4, 0, 1);
    return {
        vec,
        similarity,
        score: similarity * (0.7 + 0.2 * quality + 0.1 * confidence),
        // As close as your favourites -> ~86%; the curve flattens so "99%" stays rare
        match: clamp(Math.round(100 * Math.tanh((1.3 * Math.max(0, similarity)) / taste.reference)), 0, 99),
    };
}

/** Why a liked game is a good reason: strongest fact first. */
export function becauseOf(signal) {
    const base = { key: signal.key, appid: signal.appid || null, name: signal.name || signal.app?.name || '', hours: signal.hours || 0, rating: signal.rating || null };
    if (signal.rating === 5) return { kind: 'rated', ...base };
    if (signal.hours >= 20) return { kind: 'hours', ...base };
    if (isPerfect(signal.achievement)) return { kind: 'perfect', ...base };
    if (signal.status === 'completed') return { kind: 'completed', ...base };
    if (signal.hours >= 2) return { kind: 'hours', ...base };
    if (signal.rating === 4) return { kind: 'rated', ...base };
    if (signal.status === 'playing') return { kind: 'playing', ...base };
    if (signal.status === 'wishlist') return { kind: 'wishlisted', ...base };
    return { kind: 'similar', ...base };
}

/** -> { because: reason | null, sharedTags: [tagid] } */
export function explain(vec, taste, excludeAppid = null) {
    let best = null;
    for (const signal of taste.liked.slice(0, 80)) {
        if (signal.appid === excludeAppid) continue;
        const similarity = dot(vec, signal.vec);
        if (similarity < REASON_MIN_SIMILARITY) continue;
        const contribution = similarity * signal.weight;
        if (!best || contribution > best.contribution) best = { signal, contribution };
    }
    const sharedTags = [...vec]
        .filter(([tag]) => !BROAD_TAGS.has(tag))
        .map(([tag, value]) => [tag, value * (taste.positive.get(tag) || 0)])
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);
    return { because: best ? becauseOf(best.signal) : null, sharedTags };
}

/** Greedy re-ranking so the list isn't ten versions of the same game. */
function diversify(sorted, limit) {
    const pool = sorted.slice(0, limit * 4);
    const chosen = [];
    while (chosen.length < limit && pool.length) {
        let bestIndex = 0;
        let bestValue = -Infinity;
        pool.forEach((candidate, index) => {
            const overlap = chosen.reduce((max, picked) => Math.max(max, dot(candidate.vec, picked.vec)), 0);
            const value = candidate.rank * (1 - (0.5 * Math.max(0, overlap - 0.6)) / 0.4);
            if (value > bestValue) {
                bestValue = value;
                bestIndex = index;
            }
        });
        chosen.push(pool.splice(bestIndex, 1)[0]);
    }
    return chosen;
}

function card(entry, taste) {
    const { app } = entry;
    const { because, sharedTags } = explain(entry.vec, taste, app.appid);
    return {
        appid: app.appid,
        name: app.name,
        image: app.image,
        match: entry.match,
        price: app.price || null,
        isFree: Boolean(app.isFree),
        earlyAccess: Boolean(app.earlyAccess),
        reviewPct: app.reviewPct ?? null,
        reviewCount: app.reviewCount || 0,
        onWishlist: Boolean(entry.onWishlist),
        because,
        sharedTags,
    };
}

const byRank = (a, b) => b.rank - a.rank;

/**
 * input: { items, achievements, apps: Map, keyToAppid: Map, candidates: Set|Map of appids,
 *          wishlist: appids (Steam wishlist), hidden: appids, limits: { picks, deals, backlog } }
 */
export function recommend({
    items = [], achievements = [], apps = new Map(), keyToAppid = new Map(), candidates = new Set(),
    wishlist = [], hidden = [], limits = {},
}) {
    const { picks: pickLimit = 24, deals: dealLimit = 12, backlog: backlogLimit = 6 } = limits;
    const hiddenSet = new Set(hidden.map(Number));
    const signals = collectSignals(items, achievements);
    for (const appid of hiddenSet) {
        signals.push({ key: `steam-${appid}`, name: apps.get(appid)?.name || '', hours: 0, rating: null, status: 'hidden', achievement: null, weight: HIDDEN_WEIGHT });
    }

    const idf = computeIdf([...apps.values()]);
    const taste = buildTaste(signals, apps, keyToAppid, idf);
    const empty = { taste, picks: [], deals: [], backlog: [] };
    if (!taste.ready) return empty;

    // What you already have (wishlisted games are still recommendable)
    const owned = new Set();
    const ownedTitles = new Set();
    const wishlisted = new Set(wishlist.map(Number));
    for (const item of items) {
        const appid = appidOf(item.gameKey, keyToAppid);
        if (item.status === 'wishlist') {
            if (appid) wishlisted.add(appid);
            continue;
        }
        if (appid) owned.add(appid);
        if (item.name) ownedTitles.add(normalizeTitle(item.name));
    }
    for (const game of achievements) {
        const appid = appidOf(game.gameKey, keyToAppid);
        if (appid) owned.add(appid);
        if (game.name) ownedTitles.add(normalizeTitle(game.name));
    }
    const likesAdultContent = taste.positive.has(TAGS.sexualContent);

    const scored = [];
    for (const app of apps.values()) {
        const onWishlist = wishlisted.has(app.appid);
        if (!onWishlist && !candidates.has(app.appid)) continue;
        if (app.type !== 0 || app.comingSoon || !app.tags?.length) continue;
        if (owned.has(app.appid) || hiddenSet.has(app.appid) || ownedTitles.has(normalizeTitle(app.name))) continue;
        if (!likesAdultContent && app.tags.slice(0, 8).includes(TAGS.sexualContent)) continue;
        const result = scoreApp(app, taste, idf);
        if (result.similarity <= 0) continue;
        scored.push({ app, onWishlist, ...result });
    }

    // For you: well reviewed; games already on your wishlist rank a little lower (you know them)
    const picks = diversify(
        scored
            .filter(c => c.app.reviewCount < 30 || c.app.reviewPct == null || c.app.reviewPct >= 65)
            .map(c => ({ ...c, rank: c.score * (c.onWishlist ? 0.85 : 1) }))
            .sort(byRank),
        pickLimit,
    ).map(c => card(c, taste));

    // On sale and your taste (wishlisted games need less of a match)
    const deals = scored
        .filter(c => c.app.price?.discount >= 20 && (c.match >= 50 || (c.onWishlist && c.match >= 30)))
        .map(c => ({ ...c, rank: c.score * (0.75 + (0.25 * c.app.price.discount) / 100) + (c.onWishlist ? 0.08 : 0) }))
        .sort(byRank)
        .slice(0, dealLimit)
        .map(c => card(c, taste));

    // Backlog: taste, short games first, and games you already started
    const backlogAll = [];
    const seen = new Set();
    for (const item of items) {
        if (item.status !== 'backlog') continue;
        const appid = appidOf(item.gameKey, keyToAppid);
        const app = appid ? apps.get(appid) : null;
        if (!app?.tags?.length || seen.has(appid)) continue;
        seen.add(appid);
        const result = scoreApp(app, taste, idf);
        const hours = itemHours(item);
        const short = app.tags.includes(TAGS.short);
        const started = hours >= 0.3 && hours < 10;
        backlogAll.push({
            ...result,
            app,
            rank: result.score * (short ? 0.96 : 0.9) + (started ? 0.06 : 0) + (item.rating >= 4 ? 0.05 : 0),
            gameKey: item.gameKey,
            hours,
            started,
            short,
        });
    }
    backlogAll.sort(byRank);
    const backlog = backlogAll.slice(0, backlogLimit).map(entry => ({
        ...card(entry, taste),
        gameKey: entry.gameKey,
        hours: entry.hours,
        started: entry.started,
        short: entry.short,
    }));

    return { taste, picks, deals, backlog };
}

/** Small copy of the top picks for users/{uid}.forYou (home page teaser). */
export function teaserSnapshot(result, count = 4) {
    return result.picks.slice(0, count).map(pick => ({
        appid: pick.appid,
        name: String(pick.name).slice(0, 120),
        image: pick.image,
        match: pick.match,
        because: pick.because ? { kind: pick.because.kind, name: String(pick.because.name).slice(0, 120), hours: Math.round(pick.because.hours), rating: pick.because.rating } : null,
        discount: pick.price?.discount || 0,
    }));
}
