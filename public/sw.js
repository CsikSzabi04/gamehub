/* GameDataHub service worker: installable app, offline shell, Web Push notifications.
 *
 * Caching (runtime, no build step):
 *   - page navigations   network first, falls back to the cached app shell ("/") when offline
 *   - /assets/*, /fonts/* cache first (file names are content hashed / immutable)
 *   - images             cache first, capped
 *   - /api-snapshot/*    stale-while-revalidate
 *   - everything else (backend API, Firebase) goes straight to the network
 */
const VERSION = 'gdh-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const IMAGE_CACHE = `${VERSION}-images`;
const DATA_CACHE = `${VERSION}-data`;
const MAX_IMAGES = 250;

const SHELL_URLS = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/favicon-64.png'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then(cache => cache.addAll(SHELL_URLS))
            .catch(() => {})
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key)));
        if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
        await self.clients.claim();
    })());
});

async function trimCache(name, max) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirstPage(event) {
    const cache = await caches.open(SHELL_CACHE);
    try {
        const preload = await event.preloadResponse;
        const response = preload || await fetch(event.request);
        if (response.ok) cache.put('/', response.clone());
        return response;
    } catch {
        return (await cache.match('/')) || Response.error();
    }
}

async function cacheFirst(request, cacheName, max) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    // Opaque (no-cors) responses are skipped: browsers count each one as several MB of quota
    if (response.ok) {
        cache.put(request, response.clone());
        if (max) trimCache(cacheName, max);
    }
    return response;
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const network = fetch(request)
        .then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);
    return cached || network;
}

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    if (request.mode === 'navigate' && url.origin === self.location.origin) {
        event.respondWith(networkFirstPage(event));
        return;
    }
    if (url.origin === self.location.origin) {
        if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/icons/')) {
            event.respondWith(cacheFirst(request, ASSET_CACHE));
            return;
        }
        if (url.pathname.startsWith('/api-snapshot/')) {
            event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
            return;
        }
        if (url.pathname.startsWith('/img-cache/') || /\.(png|webp|jpe?g|svg|gif)$/i.test(url.pathname)) {
            event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
        }
        return;
    }
    // Game artwork from known image CDNs
    if (request.destination === 'image' && /(^|\.)(steamstatic\.com|rawg\.io|wsrv\.nl|gog-statics\.com|s-microsoft\.com)$/.test(url.hostname)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES).catch(() => fetch(request)));
    }
});

/* ---------------- Push notifications ---------------- */

self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data ? event.data.text() : '' };
    }
    const title = data.title || 'GameDataHub';
    const options = {
        body: data.body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        image: data.image || undefined,
        tag: data.tag || undefined,
        renotify: Boolean(data.tag),
        data: { url: data.url || '/notifications', id: data.id || null },
        vibrate: [80, 40, 80],
    };
    event.waitUntil((async () => {
        await self.registration.showNotification(title, options);
        // Tell open tabs so the bell updates instantly
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        windows.forEach(client => client.postMessage({ type: 'gdh-push', payload: data }));
        if (self.navigator && 'setAppBadge' in self.navigator) self.navigator.setAppBadge().catch(() => {});
    })());
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                await client.focus();
                if ('navigate' in client) return client.navigate(target).catch(() => client.postMessage({ type: 'gdh-navigate', url: target }));
                return client.postMessage({ type: 'gdh-navigate', url: target });
            }
        }
        return self.clients.openWindow(target);
    })());
});

// The browser rotated the subscription: ask an open tab to save the new one (it has the user + VAPID key)
self.addEventListener('pushsubscriptionchange', event => {
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        windows.forEach(client => client.postMessage({ type: 'gdh-resubscribe' }));
    })());
});
