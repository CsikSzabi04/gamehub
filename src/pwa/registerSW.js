// Service worker registration + messages from it (push received, open a URL, re-subscribe).
const SW_URL = '/sw.js';
const listeners = new Set();

let registrationPromise = null;

export function registerServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return Promise.resolve(null);
    if (!registrationPromise) {
        registrationPromise = navigator.serviceWorker
            .register(SW_URL, { scope: '/' })
            .catch(error => {
                console.error('Service worker registration failed:', error);
                registrationPromise = null;
                return null;
            });
        navigator.serviceWorker.addEventListener('message', event => {
            listeners.forEach(fn => fn(event.data || {}));
        });
    }
    return registrationPromise;
}

/** The active registration (optionally registering it first). */
export async function getServiceWorker({ register = false } = {}) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
    if (register || registrationPromise) await registerServiceWorker();
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (!existing) return null;
    return navigator.serviceWorker.ready;
}

/** Subscribe to service worker messages: { type: 'gdh-push' | 'gdh-navigate' | 'gdh-resubscribe', ... } */
export function onServiceWorkerMessage(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
