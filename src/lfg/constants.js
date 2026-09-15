// LFG (looking for group) options, limits and small pure helpers.
import { useEffect, useState } from 'react';
import { toDate } from '../lib/firebase.js';

export const OTHER_GAME = 'other';
export const PLATFORMS = ['pc', 'playstation', 'xbox', 'switch', 'mobile', 'crossplay'];
export const MODES = ['casual', 'ranked', 'coop', 'custom'];
export const REGIONS = ['any', 'eu', 'na', 'asia'];
export const AGE_GROUPS = ['any', '18+', '13-17'];
export const LANGUAGE_CODES = ['any', 'en', 'hu', 'de', 'fr', 'es', 'it', 'pl', 'pt', 'ro', 'sk', 'cs', 'ru', 'tr', 'nl'];
export const DURATIONS = [2, 6, 24, 72];
export const EXTEND_HOURS = [2, 6, 24];
export const MAX_EXPIRY_HOURS = 72;
export const REPORT_REASONS = ['spam', 'abuse', 'scam', 'underage', 'other'];

export const LIMITS = {
    rank: 40,
    note: 300,
    message: 200,
    contact: 60,
    gameName: 60,
    reason: 300,
    slotsMax: 9,
    postsPerDay: 5,
};

const HOUR = 60 * 60 * 1000;
export const hoursMs = hours => hours * HOUR;

/** i18n key segment for an age group value ('18+' is not a nice key). */
export const ageKey = value => ({ '13-17': 'teen', '18+': 'adult' }[value] || 'any');

export const clip = (value, max) => String(value ?? '').trim().slice(0, max);

export const millis = value => toDate(value)?.getTime() ?? null;

/** Posts whose createdAt is still a pending server timestamp count as "just now". */
export const createdMillis = post => millis(post?.createdAt) ?? Date.now();

export const isExpired = (post, now) => (millis(post?.expiresAt) ?? 0) <= now;
export const isFull = post => (post?.filled || 0) >= (post?.slots || 0);
export const isOpen = (post, now) => Boolean(post) && !post.closed && !isExpired(post, now) && !isFull(post);

/** Display name of a language code in the UI locale. */
export function languageName(code, locale) {
    if (!code || code === 'any') return null;
    try {
        const names = new Intl.DisplayNames([locale], { type: 'language' });
        const name = names.of(code);
        return name ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) : code.toUpperCase();
    } catch {
        return code.toUpperCase();
    }
}

/** "1h 20m" style countdown text. */
export function timeLeftLabel(ms, t) {
    if (ms <= 0) return t('lfg.time.expired');
    const minutes = Math.max(1, Math.floor(ms / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    if (days > 0) return t('lfg.time.dh', { d: days, h: hours });
    if (hours > 0) return t('lfg.time.hm', { h: hours, m: mins });
    return t('lfg.time.m', { m: mins });
}

/** Label of the `when` field: now | tonight | ISO datetime. */
export function whenLabel(when, t, locale) {
    if (!when || when === 'now') return t('lfg.when.now');
    if (when === 'tonight') return t('lfg.when.tonight');
    const date = toDate(when);
    if (!date) return t('lfg.when.now');
    return date.toLocaleString(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Re-renders every `intervalMs` and returns the current time (for countdowns). */
export function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

export const EMPTY_FILTERS = { game: '', platform: '', mode: '', language: '', region: '', micOnly: false };

export const hasActiveFilters = filters => Object.entries(EMPTY_FILTERS).some(([key, value]) => filters[key] !== value);

/** In-memory filter matching (crossplay / 'any' language / 'any' region posts match every choice). */
export function matchesFilters(post, filters) {
    if (filters.game && post.game !== filters.game) return false;
    if (filters.platform && post.platform !== filters.platform && post.platform !== 'crossplay') return false;
    if (filters.mode && post.mode !== filters.mode) return false;
    if (filters.language && post.language !== filters.language && post.language !== 'any') return false;
    if (filters.region && post.region !== filters.region && post.region !== 'any') return false;
    if (filters.micOnly && !post.mic) return false;
    return true;
}

/** Same game check for "one active post per game" ('other' games compare by name). */
export function sameGame(a, b) {
    if (a.game !== b.game) return false;
    if (a.game !== OTHER_GAME) return true;
    return clip(a.gameName, LIMITS.gameName).toLowerCase() === clip(b.gameName, LIMITS.gameName).toLowerCase();
}

// Last contact the user typed (Discord tag etc.) – kept on this device only, to prefill forms.
const CONTACT_KEY = 'gdh-lfg-contact';
export function rememberedContact() {
    try {
        return localStorage.getItem(CONTACT_KEY) || '';
    } catch {
        return '';
    }
}
export function rememberContact(value) {
    try {
        if (value) localStorage.setItem(CONTACT_KEY, clip(value, LIMITS.contact));
    } catch {
        // storage unavailable
    }
}

/** Validates the create-post form. Returns { errors: {field: i18nKey}, data } */
export function validatePost(form, now) {
    const errors = {};
    const game = form.game || '';
    const gameName = clip(form.gameName, LIMITS.gameName);
    if (!game) errors.game = 'lfg.errors.game';
    if (game === OTHER_GAME && gameName.length < 2) errors.gameName = 'lfg.errors.gameName';
    if (!PLATFORMS.includes(form.platform)) errors.platform = 'lfg.errors.required';
    if (!MODES.includes(form.mode)) errors.mode = 'lfg.errors.required';
    const slots = Number(form.slots);
    if (!Number.isInteger(slots) || slots < 1 || slots > LIMITS.slotsMax) errors.slots = 'lfg.errors.slots';
    const hours = Number(form.duration);
    if (!DURATIONS.includes(hours)) errors.duration = 'lfg.errors.required';
    const expiresAt = now + hoursMs(hours || 2);

    let when = form.when;
    if (when === 'custom') {
        const date = form.whenAt ? new Date(form.whenAt) : null;
        if (!date || Number.isNaN(date.getTime())) errors.whenAt = 'lfg.errors.whenAt';
        else if (date.getTime() < now - 5 * 60000) errors.whenAt = 'lfg.errors.whenPast';
        else if (date.getTime() > expiresAt) errors.whenAt = 'lfg.errors.whenAfterExpiry';
        else when = date.toISOString();
    } else if (when !== 'now' && when !== 'tonight') {
        when = 'now';
    }

    return {
        errors,
        data: {
            game,
            gameName,
            platform: form.platform,
            mode: form.mode,
            rank: clip(form.rank, LIMITS.rank),
            language: LANGUAGE_CODES.includes(form.language) ? form.language : 'any',
            region: REGIONS.includes(form.region) ? form.region : 'any',
            mic: Boolean(form.mic),
            ageGroup: AGE_GROUPS.includes(form.ageGroup) ? form.ageGroup : 'any',
            slots,
            when,
            note: clip(form.note, LIMITS.note),
            expiresAtMs: expiresAt,
        },
    };
}
