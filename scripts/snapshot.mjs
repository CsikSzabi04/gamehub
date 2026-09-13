// Saves the home page API responses into public/api-snapshot/*.json at build time.
// First-time visitors get these from the static host's CDN while the live API
// (which may be cold-starting on Render) is still loading; see src/Components/apiCache.js.
// Never fails the build: on errors the previous snapshot file is kept.
import { mkdir, writeFile, stat } from 'node:fs/promises';

const API_BASE = process.env.SNAPSHOT_API_BASE || 'https://gamehub-backend-zekj.onrender.com';
const PATHS = ['fetch-games', 'stores', 'free', 'discounted', 'loot', 'news', 'getgamingnews', 'movies', 'characters', 'charactersK', 'hub/steam/featured', 'hub/steam/most-played', 'hub/universes'];
const OUT_DIR = new URL('../public/api-snapshot/', import.meta.url);
const TIMEOUT = 90_000; // a sleeping Render instance can take ~60 s to wake up

await mkdir(OUT_DIR, { recursive: true });

async function save(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
        const res = await fetch(`${API_BASE}/${path}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && !Array.isArray(data) && data.error) throw new Error(`API error: ${JSON.stringify(data.error)}`);
        const body = JSON.stringify(data);
        const target = new URL(`${path}.json`, OUT_DIR);
        await mkdir(new URL('.', target), { recursive: true });
        await writeFile(target, body);
        console.log(`snapshot ${path}: ${(body.length / 1024).toFixed(0)} kB`);
    } catch (error) {
        const kept = await stat(new URL(`${path}.json`, OUT_DIR)).then(() => 'keeping previous file', () => 'no snapshot');
        console.warn(`snapshot ${path} failed (${error.message}), ${kept}`);
    } finally {
        clearTimeout(timer);
    }
}

// Wake the backend first, then fetch in parallel
await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(TIMEOUT) }).catch(() => {});
await Promise.all(PATHS.map(save));

// ── Mirror the home page's RAWG images onto the static host ──
// Opening a connection to media.rawg.io costs 0.5-0.8 s on a first visit. Copies served from our
// own origin reuse the page's connection. src/Components/rawgImage.js reads the manifest and
// uses the local copy when one exists (otherwise the RAWG CDN URL).
const MIRROR_DIR = new URL('../public/img-cache/rawg/', import.meta.url);
const MANIFEST = new URL('../src/Components/rawgMirror.json', import.meta.url);
const MIRROR_WIDTHS = [200, 420, 640, 1280];

async function mirrorImages() {
    let games;
    try {
        const { readFile } = await import('node:fs/promises');
        games = JSON.parse(await readFile(new URL('fetch-games.json', OUT_DIR), 'utf8')).games || [];
    } catch {
        return console.warn('image mirror skipped: no fetch-games snapshot');
    }
    const paths = [...new Set(games.map(g => g.background_image?.match(/^https:\/\/media\.rawg\.io\/media\/(games\/.+)$/)?.[1]).filter(Boolean))];
    const mirrored = [];
    let bytes = 0;
    await Promise.all(paths.map(async p => {
        try {
            for (const w of MIRROR_WIDTHS) {
                const target = new URL(`${w}/${p}`, MIRROR_DIR);
                const exists = await stat(target).then(() => true, () => false);
                if (!exists) {
                    const res = await fetch(`https://media.rawg.io/media/resize/${w}/-/${p}`, { signal: AbortSignal.timeout(30_000) });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const buf = Buffer.from(await res.arrayBuffer());
                    await mkdir(new URL('.', target), { recursive: true });
                    await writeFile(target, buf);
                    bytes += buf.length;
                }
            }
            mirrored.push(p);
        } catch (error) {
            console.warn(`image mirror ${p} failed (${error.message})`);
        }
    }));
    await writeFile(MANIFEST, JSON.stringify(mirrored.sort(), null, 1) + '\n');
    console.log(`image mirror: ${mirrored.length}/${paths.length} games, ${(bytes / 1024 / 1024).toFixed(1)} MB downloaded`);
}

await mirrorImages();

// ── Mirror other above-the-fold images (Steam charts, Hub universe covers) ──
// Manifest maps the exact remote URL to the local copy; used by src/Hub/HubImage.jsx via
// src/Components/imageMirror.js. Existing files are reused, so a build only downloads new images.
// Universe covers are up to 2.2 MB PNGs shown ~250 px wide: when the optional `sharp` module is
// available (or SHARP_MODULE points to it) they are stored as 480 px WebP instead.
const STORE_MIRROR_DIR = new URL('../public/img-cache/store/', import.meta.url);
const STORE_MANIFEST = new URL('../src/Components/imageMirror.json', import.meta.url);

async function loadSnapshot(path) {
    const { readFile } = await import('node:fs/promises');
    try {
        return JSON.parse(await readFile(new URL(`${path}.json`, OUT_DIR), 'utf8'));
    } catch {
        return null;
    }
}

async function mirrorStoreImages() {
    const featured = await loadSnapshot('hub/steam/featured');
    const mostPlayed = await loadSnapshot('hub/steam/most-played');
    const universes = await loadSnapshot('hub/universes');
    const images = item => item?.image;
    const jobs = [
        ...(featured?.topSellers || []).slice(0, 10).map(images),
        ...(featured?.newReleases || []).slice(0, 10).map(images),
        ...(mostPlayed?.items || []).slice(0, 12).map(images),
    ].map(url => ({ url }));
    for (const u of Array.isArray(universes) ? universes : []) jobs.push({ url: u.cover, width: 480 });

    let sharp = null;
    try {
        const { pathToFileURL } = await import('node:url');
        sharp = (await import(process.env.SHARP_MODULE ? pathToFileURL(process.env.SHARP_MODULE).href : 'sharp')).default;
    } catch { /* optional */ }

    const { createHash } = await import('node:crypto');
    const manifest = {};
    await mkdir(STORE_MIRROR_DIR, { recursive: true });
    const seen = new Set();
    await Promise.all(jobs.filter(j => typeof j.url === 'string' && j.url.startsWith('https://') && !seen.has(j.url) && seen.add(j.url)).map(async ({ url, width }) => {
        const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
        const ext = (new URL(url).pathname.match(/\.(jpe?g|png|webp|gif)$/i)?.[0] || '.jpg').toLowerCase();
        const candidates = width ? [`${hash}-${width}.webp`, hash + ext] : [hash + ext];
        try {
            let name = null;
            for (const c of candidates) {
                if (await stat(new URL(c, STORE_MIRROR_DIR)).then(() => true, () => false)) { name = c; break; }
            }
            if (!name) {
                const res = await fetch(url, {
                    signal: AbortSignal.timeout(30_000),
                    headers: { 'User-Agent': 'GameDataHub/1.0 (+https://gamedatahub.netlify.app)', Accept: 'image/*,*/*' },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                let buf = Buffer.from(await res.arrayBuffer());
                name = hash + ext;
                if (width && sharp) {
                    buf = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
                    name = candidates[0];
                }
                await writeFile(new URL(name, STORE_MIRROR_DIR), buf);
            }
            manifest[url] = `/img-cache/store/${name}`;
        } catch (error) {
            console.warn(`image mirror ${url} failed (${error.message})`);
        }
    }));
    await writeFile(STORE_MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
    console.log(`store/hub image mirror: ${Object.keys(manifest).length}/${seen.size} images${sharp ? '' : ' (sharp not available: covers kept at original size)'}`);
}

await mirrorStoreImages();
