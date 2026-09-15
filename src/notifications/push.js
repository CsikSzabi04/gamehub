// Web Push on this device: service worker subscription saved to users/{uid}/push/{id}.
// Works on Android/desktop browsers, and on iPhone/iPad (iOS 16.4+) once the site is added to the Home Screen.
import { firestore } from '../lib/firebase.js';
import { apiGet } from '../lib/api.js';
import { getServiceWorker } from '../pwa/registerSW.js';

// Public VAPID key (safe to ship). The backend's /notify/config wins when it answers.
const FALLBACK_VAPID_KEY = 'BBmNdOIHQr9qzoY6YMnQnYf8f-V7v7HtdZCXvouer0jgnGQAJ7I-fGaEylmJO0F2oZz9Wyz93cwF6_GJT6rHXwQ';

import { isIos, isStandalone } from '../pwa/platform.js';

export { isIos, isStandalone };

/** 'supported' | 'ios-needs-install' | 'unsupported' */
export function pushSupport() {
    if (typeof window === 'undefined') return 'unsupported';
    const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (isIos() && !isStandalone()) return 'ios-needs-install';
    return hasApis ? 'supported' : 'unsupported';
}

export const notificationPermission = () => (typeof Notification !== 'undefined' ? Notification.permission : 'default');

let vapidPromise = null;
function vapidKey() {
    if (!vapidPromise) {
        vapidPromise = apiGet('/notify/config')
            .then(config => config?.vapidPublicKey || FALLBACK_VAPID_KEY)
            .catch(() => FALLBACK_VAPID_KEY);
    }
    return vapidPromise;
}

function base64UrlToUint8Array(value) {
    const padding = '='.repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function subscriptionId(endpoint) {
    const bytes = new TextEncoder().encode(endpoint);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash).slice(0, 16), b => b.toString(16).padStart(2, '0')).join('');
}

function deviceLabel() {
    const ua = navigator.userAgent;
    const os = /Android/.test(ua) ? 'Android' : isIos() ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Device';
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return `${browser} · ${os}${isStandalone() ? ' (app)' : ''}`;
}

export async function currentSubscription() {
    if (pushSupport() !== 'supported') return null;
    const registration = await getServiceWorker();
    return registration ? registration.pushManager.getSubscription() : null;
}

async function saveSubscription(user, subscription) {
    const json = subscription.toJSON();
    const id = await subscriptionId(json.endpoint);
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    await setDoc(doc(db, 'users', user.uid, 'push', id), {
        endpoint: json.endpoint,
        keys: json.keys,
        device: deviceLabel(),
        lastSeenAt: serverTimestamp(),
    }, { merge: true });
    return id;
}

/** Asks for permission (must be called from a click) and saves the subscription. Throws Error with .code. */
export async function enablePush(user) {
    if (!user?.uid) throw Object.assign(new Error('Sign in first'), { code: 'signed-out' });
    const support = pushSupport();
    if (support !== 'supported') throw Object.assign(new Error('Push not supported'), { code: support });

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw Object.assign(new Error('Permission denied'), { code: permission === 'denied' ? 'denied' : 'dismissed' });

    const registration = await getServiceWorker({ register: true });
    if (!registration) throw Object.assign(new Error('Service worker unavailable'), { code: 'no-sw' });

    let subscription = await registration.pushManager.getSubscription();
    const key = await vapidKey();
    if (subscription) {
        // A subscription made with another server key cannot be used: replace it
        const current = subscription.options?.applicationServerKey;
        if (current) {
            const currentKey = btoa(String.fromCharCode(...new Uint8Array(current))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            if (currentKey !== key) {
                await subscription.unsubscribe().catch(() => {});
                subscription = null;
            }
        }
    }
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(key) });
    }
    await saveSubscription(user, subscription);
    const { db, doc, setDoc } = await firestore();
    await setDoc(doc(db, 'users', user.uid), { notificationPrefs: { push: true } }, { merge: true });
    return subscription;
}

export async function disablePush(user) {
    const subscription = await currentSubscription();
    if (!subscription) return;
    if (user?.uid) {
        const id = await subscriptionId(subscription.endpoint);
        const { db, doc, deleteDoc } = await firestore();
        await deleteDoc(doc(db, 'users', user.uid, 'push', id)).catch(() => {});
    }
    await subscription.unsubscribe().catch(() => {});
}

/** On sign-in: re-save an existing subscription under this account (also refreshes lastSeenAt). */
export async function syncPush(user) {
    if (!user?.uid || notificationPermission() !== 'granted') return false;
    try {
        let subscription = await currentSubscription();
        if (!subscription) {
            const registration = await getServiceWorker();
            if (!registration) return false;
            subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(await vapidKey()) });
        }
        await saveSubscription(user, subscription);
        return true;
    } catch (error) {
        console.error('Push sync failed:', error);
        return false;
    }
}
