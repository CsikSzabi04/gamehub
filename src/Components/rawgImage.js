import mirrored from './rawgMirror.json';

// RAWG serves originals of up to several MB (e.g. 3.7 MB for one cover).
// Its CDN also serves resized copies, but only at these widths:
const RAWG_WIDTHS = [80, 200, 420, 640, 1280, 1920];
const RAWG_MEDIA = /^https:\/\/media\.rawg\.io\/media\/((?:games|screenshots)\/.+)$/;

// Home page images copied to our own static host at build time (scripts/snapshot.mjs)
const MIRROR = new Set(mirrored);
const MIRROR_WIDTHS = [200, 420, 640, 1280];

/** Returns a resized RAWG image URL (smallest allowed width >= width). Other URLs are returned unchanged. */
export function rawgImg(url, width = 640) {
    const match = typeof url === 'string' && url.match(RAWG_MEDIA);
    if (!match) return url;
    const path = match[1];
    if (MIRROR.has(path)) {
        const w = MIRROR_WIDTHS.find(x => x >= width) || 1280;
        return `/img-cache/rawg/${w}/${path}`;
    }
    const w = RAWG_WIDTHS.find(x => x >= width) || 1920;
    return `https://media.rawg.io/media/resize/${w}/-/${path}`;
}

/** srcSet for card-sized images: lets the browser pick 420 or 640 px depending on screen density. */
export function rawgSrcSet(url) {
    if (typeof url !== 'string' || !RAWG_MEDIA.test(url)) return undefined;
    return `${rawgImg(url, 420)} 420w, ${rawgImg(url, 640)} 640w`;
}
