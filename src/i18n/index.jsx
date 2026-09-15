import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { UserContext } from '../Features/UserContext.jsx';

/*
 * Tiny i18n layer (no dependency).
 *
 * Every file in ./locales/ is a namespace, picked up automatically:
 *   // src/i18n/locales/profile.js
 *   export default { en: { title: 'Profile' }, hu: { title: 'Profil' }, de: { title: 'Profil' } };
 *
 * Usage in a component:
 *   const { t, lang, locale } = useT();
 *   t('profile.title')                 -> 'Profil'
 *   t('profile.levelUp', { level: 5 }) -> '{level}' placeholders are filled in
 *   t('profile.days', { count: 3 })    -> uses 'days_one' / 'days_other' when those keys exist
 * A missing key falls back to English, then to the key itself.
 *
 * Loading: the namespaces the home page, header and footer need are bundled (EAGER below).
 * Every other namespace is its own chunk, loaded the first time a key from it is requested
 * (t() returns '' until then and the component re-renders once it arrives). Route loaders in
 * App.jsx preload a page's namespaces together with its chunk, so pages render translated.
 */

export const LANGUAGES = [
    { code: 'hu', label: 'Magyar', flag: '🇭🇺', locale: 'hu-HU' },
    { code: 'en', label: 'English', flag: '🇬🇧', locale: 'en-US' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
];

const CODES = LANGUAGES.map(l => l.code);
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'gdh-lang';

// Keep this list in sync with the brace pattern in the first glob (globs must be literals)
const eagerModules = import.meta.glob(
    './locales/{common,header,nav,footer,home,search,rotate,cards,startup,game,hub,communityUi,notifications,pwa}.js',
    { eager: true },
);
const lazyModules = import.meta.glob([
    './locales/*.js',
    '!./locales/{common,header,nav,footer,home,search,rotate,cards,startup,game,hub,communityUi,notifications,pwa}.js',
]);

const nsOf = path => path.match(/\/([^/]+)\.js$/)[1];
const LOADERS = Object.fromEntries(Object.entries(lazyModules).map(([path, load]) => [nsOf(path), load]));

const DICTIONARIES = Object.fromEntries(CODES.map(code => [code, {}]));
const loaded = new Set();
const pending = new Map();

function register(ns, mod) {
    for (const code of CODES) DICTIONARIES[code][ns] = mod?.default?.[code] || {};
    loaded.add(ns);
}

for (const [path, mod] of Object.entries(eagerModules)) register(nsOf(path), mod);

/* Tiny store so every useT() consumer re-renders when a namespace arrives */
let version = 0;
const listeners = new Set();
const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};
const getVersion = () => version;

/** Loads namespaces (no-op for ones already loaded). Resolves when all are available. */
export function loadNamespaces(namespaces) {
    return Promise.all(namespaces.map(ns => {
        if (loaded.has(ns) || !LOADERS[ns]) return undefined;
        if (!pending.has(ns)) {
            pending.set(ns, LOADERS[ns]()
                .then(mod => {
                    register(ns, mod);
                    version++;
                    listeners.forEach(listener => listener());
                })
                .catch(error => console.error(`Error loading translations "${ns}":`, error))
                .finally(() => pending.delete(ns)));
        }
        return pending.get(ns);
    }));
}

export function loadAllNamespaces() {
    return loadNamespaces(Object.keys(LOADERS));
}

function lookup(dict, key) {
    let node = dict;
    for (const part of key.split('.')) {
        if (node == null || typeof node !== 'object') return undefined;
        node = node[part];
    }
    return node;
}

function interpolate(value, vars) {
    if (typeof value !== 'string' || !vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
}

export function translate(lang, key, vars) {
    const ns = key.slice(0, key.indexOf('.'));
    if (!loaded.has(ns) && LOADERS[ns]) {
        loadNamespaces([ns]);
        return '';
    }
    const dicts = lang === DEFAULT_LANG ? [DICTIONARIES[DEFAULT_LANG]] : [DICTIONARIES[lang], DICTIONARIES[DEFAULT_LANG]];
    const count = vars?.count;
    for (const dict of dicts) {
        if (!dict) continue;
        if (typeof count === 'number') {
            const plural = lookup(dict, `${key}_${count === 1 ? 'one' : 'other'}`);
            if (plural !== undefined) return interpolate(plural, vars);
        }
        const value = lookup(dict, key);
        if (value !== undefined) return interpolate(value, vars);
    }
    return key;
}

export function normalizeLang(code) {
    const short = String(code || '').slice(0, 2).toLowerCase();
    return CODES.includes(short) ? short : null;
}

function initialLang() {
    try {
        const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
        if (stored) return stored;
    } catch {
        // storage unavailable
    }
    if (typeof navigator !== 'undefined') {
        for (const candidate of navigator.languages || [navigator.language]) {
            const match = normalizeLang(candidate);
            if (match) return match;
        }
    }
    return DEFAULT_LANG;
}

// Without a provider (e.g. in tests) components get English
const LanguageContext = createContext({ lang: DEFAULT_LANG, setLang: () => {} });

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(initialLang);
    const profileLang = normalizeLang(useContext(UserContext)?.profile?.language);

    const setLang = useCallback(code => {
        const next = normalizeLang(code);
        if (next) setLangState(next);
    }, []);

    // A signed-in user's saved language (users/{uid}.language) wins over this browser's choice
    useEffect(() => {
        if (profileLang) setLangState(profileLang);
    }, [profileLang]);

    useEffect(() => {
        document.documentElement.lang = lang;
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            // storage unavailable
        }
    }, [lang]);

    const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
    const { lang, setLang } = useContext(LanguageContext);
    const dictVersion = useSyncExternalStore(subscribe, getVersion, getVersion);
    return useMemo(() => ({
        lang,
        setLang,
        locale: LANGUAGES.find(l => l.code === lang)?.locale || 'en-US',
        // dictVersion is part of the identity so memoized consumers pick up late namespaces
        t: (key, vars) => translate(lang, key, vars, dictVersion),
    }), [lang, setLang, dictVersion]);
}
