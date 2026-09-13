import manifest from './imageMirror.json';

/**
 * Above-the-fold store images copied to our own static host at build time
 * (scripts/snapshot.mjs). Returns the local copy for a known remote URL,
 * otherwise the URL unchanged. Saves a new connection to the store's CDN on a first visit.
 */
export function mirrorSrc(url) {
    return (typeof url === 'string' && manifest[url]) || url;
}

// Already small, correctly sized images: not worth a trip through the resize proxy
const SKIP_PROXY = /(^|\.)(steamstatic\.com|steampowered\.com|akamaihd\.net)$/;

/**
 * Resized WebP of a third-party image via the images.weserv.nl proxy (Cloudflare-cached).
 * Callers should fall back to the original URL if this fails.
 */
export function optimizedSrc(url, width = 480) {
    if (typeof url !== 'string' || !url.startsWith('https://')) return url;
    try {
        const { hostname, pathname } = new URL(url);
        if (SKIP_PROXY.test(hostname) || /\.(svg|gif)$/i.test(pathname)) return url;
    } catch {
        return url;
    }
    const w = Math.ceil(width / 160) * 160; // few distinct sizes -> better proxy cache hits
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&output=webp&q=78&we`;
}
