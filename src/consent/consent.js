/*
 * Cookie / local storage consent (GDPR + ePrivacy, Hungarian Eht. 155. § (4)).
 *
 * Categories:
 *   necessary   - always on: sign-in session, security, the consent record itself, offline cache, language
 *   preferences - optional conveniences remembered on this device (e.g. last LFG contact, visit counter)
 *   analytics   - optional; no analytics tool is used today, reserved so one can only run after consent
 *   marketing   - optional; no marketing/advertising tool is used today, same as above
 *
 * Usage:
 *   import { hasConsent, openCookieSettings } from '../consent/consent.js';
 *   if (hasConsent('preferences')) localStorage.setItem(...);
 */

export const CONSENT_KEY = 'gdh-consent';
// Bump to ask everyone again (e.g. when a new optional category or tool is added)
export const CONSENT_VERSION = 1;
// The choice is asked again after 12 months
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const CATEGORIES = ['necessary', 'preferences', 'analytics', 'marketing'];
export const OPTIONAL_CATEGORIES = CATEGORIES.filter(c => c !== 'necessary');

// Storage keys that belong to the optional "preferences" category; removed when it is refused
export const PREFERENCE_KEYS = ['gdh-lfg-contact', 'gdh-visits', 'gdh-install-dismissed', 'gdh-push-prompt-dismissed', 'gdh-price-cc'];

const listeners = new Set();
let cached;

function read() {
    if (cached !== undefined) return cached;
    try {
        const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY));
        const fresh = Date.now() - new Date(parsed?.updatedAt).getTime() < MAX_AGE_MS;
        cached = parsed?.version === CONSENT_VERSION && fresh ? parsed : null;
    } catch {
        cached = null;
    }
    return cached;
}

/** The saved choice, or null when the visitor has not decided yet (the banner is shown). */
export function getConsent() {
    return read();
}

export function hasConsent(category) {
    if (category === 'necessary') return true;
    return Boolean(read()?.[category]);
}

export function saveConsent(choices) {
    const record = {
        version: CONSENT_VERSION,
        necessary: true,
        ...Object.fromEntries(OPTIONAL_CATEGORIES.map(c => [c, Boolean(choices[c])])),
        updatedAt: new Date().toISOString(),
    };
    cached = record;
    try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
        if (!record.preferences) PREFERENCE_KEYS.forEach(key => localStorage.removeItem(key));
    } catch {
        // storage unavailable: the choice still applies for this page view
    }
    listeners.forEach(listener => listener({ type: 'change', consent: record }));
    return record;
}

/*
 * Storage for "preferences" values: localStorage with consent, otherwise kept in memory
 * for the current page session only (the feature still works, it just isn't remembered).
 */
const memory = new Map();
export const preferenceStorage = {
    get(key) {
        if (!hasConsent('preferences')) return memory.has(key) ? memory.get(key) : null;
        try {
            return localStorage.getItem(key);
        } catch {
            return memory.get(key) ?? null;
        }
    },
    set(key, value) {
        memory.set(key, String(value));
        if (!hasConsent('preferences')) return;
        try {
            localStorage.setItem(key, String(value));
        } catch {
            // storage unavailable: the in-memory value is used
        }
    },
};

export const acceptAll =() => saveConsent(Object.fromEntries(OPTIONAL_CATEGORIES.map(c => [c, true])));
export const rejectAll = () => saveConsent({});

/** Re-opens the banner with the settings panel (footer "Cookie settings" link, Cookie Policy page). */
export function openCookieSettings() {
    listeners.forEach(listener => listener({ type: 'open' }));
}

export function subscribeConsent(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
