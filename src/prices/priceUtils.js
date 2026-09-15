// Price tracking helpers shared by the game page price panel and the /alerts page.
//
// Firestore: users/{uid}/priceAlerts/{gameKey}
//   { gameKey, name, image, steamAppId, cc, currency, targetPrice (major units), active,
//     lastPrice, lastNotifiedPrice, lastCheckedAt, triggeredAt, createdAt, updatedAt }
// lastPrice / lastNotifiedPrice / lastCheckedAt / triggeredAt are maintained by the backend priceAlerts job.
import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api.js';
import { firestore } from '../lib/firebase.js';
import { preferenceStorage } from '../consent/consent.js';

/** Steam store regions supported by the backend (/price/steam/:appid?cc=). */
export const PRICE_REGIONS = ['hu', 'us', 'gb', 'de', 'at', 'fr', 'it', 'es', 'nl', 'pl', 'ro', 'cz', 'sk', 'se', 'dk', 'fi', 'no', 'ch', 'ca', 'au', 'br', 'tr', 'jp'];
const REGION_KEY = 'gdh-price-cc';
const DEFAULT_REGION = 'hu';

function readRegion() {
    const stored = preferenceStorage.get(REGION_KEY);
    return PRICE_REGIONS.includes(stored) ? stored : DEFAULT_REGION;
}

/** The store region used for prices, remembered in localStorage (with "preferences" consent). */
export function usePriceRegion() {
    const [cc, setCcState] = useState(readRegion);
    const setCc = next => {
        if (!PRICE_REGIONS.includes(next)) return;
        setCcState(next);
        preferenceStorage.set(REGION_KEY, next);
    };
    return [cc, setCc];
}

export function regionName(cc, locale) {
    try {
        return new Intl.DisplayNames([locale], { type: 'region' }).of(cc.toUpperCase()) || cc.toUpperCase();
    } catch {
        return cc.toUpperCase();
    }
}

export const steamPriceUrl = (appid, cc) => (appid ? `${API_BASE}/price/steam/${appid}?cc=${cc}` : null);
export const searchPriceUrl = (title, cc) => (title ? `${API_BASE}/price/search?title=${encodeURIComponent(String(title).slice(0, 120))}&cc=${cc}` : null);

/** 12.5 + 'EUR' -> "12,50 €" in the UI language. */
export function formatMoney(amount, currency, locale) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) return '–';
    try {
        if (currency) return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    } catch {
        // unknown currency code
    }
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + (currency ? ` ${currency}` : '');
}

/** Rounds a price to something a person would type (2 decimals, whole numbers for large amounts). */
export function roundPrice(value) {
    if (!(value > 0)) return 0;
    return value >= 1000 ? Math.round(value) : Math.round(value * 100) / 100;
}

/**
 * 'best' | 'good' | 'wait' | null for a Steam price response
 * (current price vs. the lowest price of the last year and the all-time low).
 */
export function priceVerdict(data) {
    const current = data?.current;
    const itad = data?.itad;
    if (!current || !itad) return null;
    const price = current.final;
    const history = (itad.history || []).map(p => p.price).filter(p => typeof p === 'number');
    const yearLow = history.length ? Math.min(...history) : null;
    const low = itad.lowest && (!data.currency || itad.lowest.currency === data.currency) ? itad.lowest.amount : null;
    if (yearLow == null && low == null) return null;

    if (yearLow != null && current.discount > 0 && price <= yearLow + 0.01) return 'best';
    if (low != null && price <= low * 1.15) return 'good';
    if (current.discount >= 40) return 'good';
    if ((low != null && price > low * 1.15) || (yearLow != null && price > yearLow * 1.1)) return 'wait';
    return null;
}

export const SALE_DISCOUNTS = [1, 25, 50, 75];

/**
 * Validated Firestore document for a price alert (only the fields the client owns).
 * mode 'target': notify at targetPrice; mode 'sale': notify when the discount is >= minDiscount (1 = any sale).
 * Saving by hand detaches an alert created from the Steam wishlist (source: null), so the wishlist sync leaves it alone.
 */
export function buildAlertDoc({ game, cc, currency, targetPrice, lastPrice, mode = 'target', minDiscount = 1 }) {
    const image = typeof game.image === 'string' && /^https?:\/\//.test(game.image) && game.image.length <= 500 ? game.image : null;
    const sale = mode === 'sale';
    return {
        gameKey: String(game.gameKey).slice(0, 60),
        name: String(game.name || '').trim().slice(0, 120),
        image,
        steamAppId: Number(game.steamAppId) || null,
        cc,
        currency: currency || null,
        mode: sale ? 'sale' : 'target',
        minDiscount: sale ? Math.min(95, Math.max(1, Math.round(Number(minDiscount) || 1))) : null,
        targetPrice: sale ? null : roundPrice(Number(targetPrice)),
        active: true,
        source: null,
        lastPrice: typeof lastPrice === 'number' ? lastPrice : null,
        // a new or changed target starts over
        lastNotifiedPrice: null,
        triggeredAt: null,
    };
}

/** Is the alert's condition met by a live Steam price ({ final, discount }) in `currency`? */
export function alertReached(alert, current, currency) {
    if (!alert || !current) return false;
    if (alert.mode === 'sale') return (current.discount || 0) >= (alert.minDiscount || 1);
    return current.final <= alert.targetPrice && (!alert.currency || !currency || alert.currency === currency);
}

/** "Any sale" / "-50% or more" / "12,50 €" */
export function alertTargetText(t, alert, currency, locale) {
    if (alert?.mode === 'sale') return alert.minDiscount > 1 ? t('prices.saleAtLeast', { percent: alert.minDiscount }) : t('prices.anySale');
    return formatMoney(alert?.targetPrice, alert?.currency || currency, locale);
}

export async function saveAlert(user, docData, isNew) {
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    const data = { ...docData, updatedAt: serverTimestamp() };
    if (isNew) data.createdAt = serverTimestamp();
    await setDoc(doc(db, 'users', user.uid, 'priceAlerts', docData.gameKey), data, { merge: true });
}

export async function updateAlert(user, key, fields) {
    const { db, doc, updateDoc, serverTimestamp } = await firestore();
    await updateDoc(doc(db, 'users', user.uid, 'priceAlerts', key), { ...fields, updatedAt: serverTimestamp() });
}

export async function removeAlert(user, key) {
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'users', user.uid, 'priceAlerts', key));
}

/** Live alert document for one game: undefined while loading, null when none. */
export function usePriceAlert(user, key) {
    const [state, setState] = useState({ id: null, alert: undefined });
    const uid = user?.uid || null;
    const id = uid && key ? `${uid}/${key}` : null;

    useEffect(() => {
        if (!uid || !key) return undefined;
        const current = `${uid}/${key}`;
        let unsubscribe = () => {};
        let active = true;
        firestore().then(({ db, doc, onSnapshot }) => {
            if (!active) return;
            unsubscribe = onSnapshot(
                doc(db, 'users', uid, 'priceAlerts', key),
                snap => setState({ id: current, alert: snap.exists() ? { id: snap.id, ...snap.data() } : null }),
                () => setState({ id: current, alert: null }),
            );
        }).catch(() => active && setState({ id: current, alert: null }));
        return () => {
            active = false;
            unsubscribe();
        };
    }, [uid, key]);

    if (!id) return null;
    return state.id === id ? state.alert : undefined;
}

/** All price alerts of the user: { alerts, loading, error }. */
export function usePriceAlerts(user) {
    const uid = user?.uid || null;
    const [state, setState] = useState({ uid: null, alerts: [], error: null });

    useEffect(() => {
        if (!uid) return undefined;
        let unsubscribe = () => {};
        let active = true;
        firestore().then(({ db, collection, onSnapshot }) => {
            if (!active) return;
            unsubscribe = onSnapshot(
                collection(db, 'users', uid, 'priceAlerts'),
                snap => {
                    const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    const time = a => a.createdAt?.toMillis?.() ?? Date.now();
                    alerts.sort((a, b) => time(b) - time(a));
                    setState({ uid, alerts, error: null });
                },
                error => setState({ uid, alerts: [], error }),
            );
        }).catch(error => active && setState({ uid, alerts: [], error }));
        return () => {
            active = false;
            unsubscribe();
        };
    }, [uid]);

    const ready = state.uid === uid;
    return { alerts: ready ? state.alerts : [], loading: Boolean(uid) && !ready, error: ready ? state.error : null };
}
