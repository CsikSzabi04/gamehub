// Shared constants/helpers for game reviews (mirrors the backend's lib/reviewsStore.js).
export const ASPECTS = ['graphics', 'story', 'gameplay', 'performance', 'value'];
export const PLATFORMS = ['pc', 'playstation', 'xbox', 'switch', 'mobile', 'steamdeck', 'other'];
export const REPORT_REASONS = ['spam', 'spoiler', 'offensive', 'offtopic', 'other'];
export const SORTS = ['helpful', 'newest', 'rating_high', 'rating_low'];
export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 5000;
export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 80;
export const PAGE_SIZE = 20;

export function emptyDraft() {
    return {
        playtimeHours: '',
        platform: '',
        pros: [],
        cons: [],
        spoiler: false,
        aspects: Object.fromEntries(ASPECTS.map(key => [key, null])),
    };
}

/** Existing review -> draft fields for editing. */
export function draftFromReview(review) {
    const draft = emptyDraft();
    if (!review) return draft;
    return {
        playtimeHours: review.playtimeHours ?? '',
        platform: review.platform || '',
        pros: Array.isArray(review.pros) ? review.pros : [],
        cons: Array.isArray(review.cons) ? review.cons : [],
        spoiler: review.spoiler === true,
        aspects: { ...draft.aspects, ...(review.aspects || {}) },
    };
}

/** Draft -> request body fields for /submit-review. */
export function draftToBody(draft) {
    const hours = draft.playtimeHours === '' || draft.playtimeHours == null ? null : Number(draft.playtimeHours);
    return {
        playtimeHours: Number.isFinite(hours) && hours >= 0 ? hours : null,
        platform: PLATFORMS.includes(draft.platform) ? draft.platform : null,
        pros: draft.pros.slice(0, MAX_TAGS),
        cons: draft.cons.slice(0, MAX_TAGS),
        spoiler: Boolean(draft.spoiler),
        aspects: draft.aspects,
    };
}

const stars = value => {
    const n = Math.round(Number(value));
    return n >= 1 && n <= 5 ? n : null;
};

const time = value => {
    const t = value ? new Date(value).getTime() : 0;
    return Number.isNaN(t) ? 0 : t;
};

/** Same summary as GET /reviews (used when talking to an older backend). */
export function summarizeReviews(list) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sums = Object.fromEntries(ASPECTS.map(key => [key, [0, 0]]));
    let sum = 0;
    let rated = 0;
    let recommended = 0;
    for (const review of list) {
        const value = stars(review.rating);
        if (value) {
            distribution[value]++;
            sum += value;
            rated++;
            if (value >= 4) recommended++;
        }
        for (const key of ASPECTS) {
            const aspect = stars(review.aspects?.[key]);
            if (aspect) {
                sums[key][0] += aspect;
                sums[key][1]++;
            }
        }
    }
    return {
        count: list.length,
        average: rated ? Math.round((sum / rated) * 10) / 10 : null,
        distribution,
        aspects: Object.fromEntries(ASPECTS.map(key => [key, sums[key][1] ? Math.round((sums[key][0] / sums[key][1]) * 10) / 10 : null])),
        recommendedPct: rated ? Math.round((recommended / rated) * 100) : null,
    };
}

const COMPARATORS = {
    helpful: (a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0) || time(b.createdAt) - time(a.createdAt),
    newest: (a, b) => time(b.createdAt) - time(a.createdAt),
    rating_high: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || time(b.createdAt) - time(a.createdAt),
    rating_low: (a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0) || time(b.createdAt) - time(a.createdAt),
};

export function sortReviews(list, sort) {
    return [...list].sort(COMPARATORS[sort] || COMPARATORS.helpful);
}

/** True when the summary has at least one aspect average. */
export const hasAspects = summary => Boolean(summary && ASPECTS.some(key => summary.aspects?.[key] != null));
