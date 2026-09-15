// Tier list helpers: vote aggregation, local drafts and the shareable PNG renderer.

export const TIERS = ['S', 'A', 'B', 'C', 'D'];
export const TIER_SCORE = { S: 5, A: 4, B: 3, C: 2, D: 1 };
export const TIER_COLORS = { S: '#f87171', A: '#fb923c', B: '#facc15', C: '#4ade80', D: '#60a5fa' };
export const MAX_VOTE_DOCS = 500;
export const MAX_RANKED = 200;
export const MIN_SECTION_ITEMS = 4;
export const MAX_SECTION_ITEMS = 150;

/** Firestore doc id of a section's vote bucket. */
export const tierDocId = (universeId, sectionId) => `${universeId}__${sectionId}`;

export const eligibleSections = sections =>
    (sections || []).filter(s => s.items?.length >= MIN_SECTION_ITEMS && s.items.length <= MAX_SECTION_ITEMS);

const emptyDist = () => ({ S: 0, A: 0, B: 0, C: 0, D: 0 });

/** Average score (1-5) -> tier letter. */
export function tierForAverage(avg) {
    const rounded = Math.min(5, Math.max(1, Math.round(avg)));
    return TIERS[5 - rounded];
}

/**
 * votes: array of { [itemId]: tier } maps. Returns { rows: { S: [{ item, avg, count, dist }] ... }, unranked: [item], voters }.
 */
export function aggregateVotes(votes, items) {
    const stats = new Map();
    let voters = 0;
    for (const tiers of votes) {
        if (!tiers || typeof tiers !== 'object') continue;
        let counted = false;
        for (const [id, tier] of Object.entries(tiers)) {
            const score = TIER_SCORE[tier];
            if (!score) continue;
            const entry = stats.get(id) || { sum: 0, count: 0, dist: emptyDist() };
            entry.sum += score;
            entry.count += 1;
            entry.dist[tier] += 1;
            stats.set(id, entry);
            counted = true;
        }
        if (counted) voters += 1;
    }

    const rows = { S: [], A: [], B: [], C: [], D: [] };
    const unranked = [];
    for (const item of items || []) {
        const entry = stats.get(String(item.id));
        if (!entry) {
            unranked.push(item);
            continue;
        }
        const avg = entry.sum / entry.count;
        rows[tierForAverage(avg)].push({ item, avg, count: entry.count, dist: entry.dist });
    }
    for (const tier of TIERS) rows[tier].sort((a, b) => b.avg - a.avg || b.count - a.count);
    return { rows, unranked, voters };
}

/** Keeps only valid tiers for items that still exist in the section (max MAX_RANKED). */
export function cleanTiers(tiers, items) {
    const ids = new Set((items || []).map(i => String(i.id)));
    const out = {};
    let n = 0;
    for (const [id, tier] of Object.entries(tiers || {})) {
        if (n >= MAX_RANKED) break;
        if (ids.has(id) && TIER_SCORE[tier]) {
            out[id] = tier;
            n += 1;
        }
    }
    return out;
}

export function sameTiers(a, b) {
    const ka = Object.keys(a || {});
    const kb = Object.keys(b || {});
    return ka.length === kb.length && ka.every(k => a[k] === b[k]);
}

const draftKey = docId => `gdh-tierlist:${docId}`;

export function readDraft(docId) {
    try {
        const raw = localStorage.getItem(draftKey(docId));
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

export function writeDraft(docId, tiers) {
    try {
        if (tiers) localStorage.setItem(draftKey(docId), JSON.stringify(tiers));
        else localStorage.removeItem(draftKey(docId));
    } catch {
        // storage unavailable
    }
}

/* ---------- Share image ---------- */

function loadOne(src, timeoutMs = 8000) {
    return new Promise(resolve => {
        const img = new Image();
        const timer = setTimeout(() => {
            img.src = '';
            resolve(null);
        }, timeoutMs);
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
            clearTimeout(timer);
            resolve(img.naturalWidth ? img : null);
        };
        img.onerror = () => {
            clearTimeout(timer);
            resolve(null);
        };
        img.src = src;
    });
}

/** CORS-clean image: the original URL first, then the resize proxy (sends ACAO: *). null when both fail. */
async function loadCorsImage(url) {
    if (typeof url !== 'string' || !url) return null;
    const direct = await loadOne(url);
    if (direct) return direct;
    if (!url.startsWith('https://')) return null;
    return loadOne(`https://wsrv.nl/?url=${encodeURIComponent(url)}&w=240&output=png`);
}

function wrapText(ctx, text, maxWidth, maxLines) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width <= maxWidth || !line) line = next;
        else {
            lines.push(line);
            line = word;
        }
        if (lines.length === maxLines) break;
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines.map(l => {
        let out = l;
        while (out.length > 1 && ctx.measureText(out).width > maxWidth) out = out.slice(0, -1);
        return out === l ? l : `${out.slice(0, -1)}…`;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/**
 * Renders { S: [item], A: [...] } to a PNG blob.
 * items: { id, name, image }. Images that fail CORS are replaced by their name.
 */
export async function renderTierImage({ title, subtitle, rows, footer = 'GameDataHub' }) {
    const WIDTH = 1200;
    const PAD = 28;
    const LABEL = 110;
    const TILE = 104;
    const GAP = 6;
    const HEADER = subtitle ? 108 : 84;
    const perRow = Math.floor((WIDTH - PAD * 2 - LABEL - GAP * 2) / (TILE + GAP));

    const all = TIERS.flatMap(tier => rows[tier] || []);
    const images = new Map(await Promise.all(all.map(async item => [String(item.id), await loadCorsImage(item.image)])));

    const rowHeights = TIERS.map(tier => Math.max(1, Math.ceil((rows[tier] || []).length / perRow)) * (TILE + GAP) + GAP);
    const height = HEADER + rowHeights.reduce((a, b) => a + b, 0) + GAP * (TIERS.length - 1) + PAD + 36;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const font = (weight, size) => `${weight} ${size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

    ctx.fillStyle = '#0a0b0f';
    ctx.fillRect(0, 0, WIDTH, height);

    ctx.fillStyle = '#eceef2';
    ctx.font = font(800, 36);
    ctx.textBaseline = 'top';
    ctx.fillText(wrapText(ctx, title, WIDTH - PAD * 2, 1)[0] || '', PAD, PAD);
    if (subtitle) {
        ctx.fillStyle = '#a1a6b3';
        ctx.font = font(500, 22);
        ctx.fillText(wrapText(ctx, subtitle, WIDTH - PAD * 2, 1)[0] || '', PAD, PAD + 48);
    }

    let y = HEADER;
    TIERS.forEach((tier, index) => {
        const h = rowHeights[index];
        ctx.fillStyle = '#111319';
        roundRect(ctx, PAD, y, WIDTH - PAD * 2, h, 12);
        ctx.fill();

        ctx.fillStyle = TIER_COLORS[tier];
        roundRect(ctx, PAD, y, LABEL, h, 12);
        ctx.fill();
        ctx.fillStyle = '#0a0b0f';
        ctx.font = font(900, 48);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tier, PAD + LABEL / 2, y + h / 2);
        ctx.textAlign = 'left';

        (rows[tier] || []).forEach((item, i) => {
            const col = i % perRow;
            const line = Math.floor(i / perRow);
            const x = PAD + LABEL + GAP * 2 + col * (TILE + GAP);
            const ty = y + GAP + line * (TILE + GAP);
            ctx.fillStyle = '#171a22';
            roundRect(ctx, x, ty, TILE, TILE, 8);
            ctx.fill();
            const img = images.get(String(item.id));
            if (img) {
                const scale = Math.min(TILE / img.naturalWidth, TILE / img.naturalHeight);
                const w = img.naturalWidth * scale;
                const ih = img.naturalHeight * scale;
                ctx.save();
                roundRect(ctx, x, ty, TILE, TILE, 8);
                ctx.clip();
                ctx.drawImage(img, x + (TILE - w) / 2, ty + (TILE - ih) / 2, w, ih);
                ctx.restore();
            } else {
                ctx.fillStyle = '#c9ccd4';
                ctx.font = font(600, 14);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const lines = wrapText(ctx, item.name, TILE - 10, 4);
                lines.forEach((text, n) => ctx.fillText(text, x + TILE / 2, ty + TILE / 2 + (n - (lines.length - 1) / 2) * 17));
                ctx.textAlign = 'left';
            }
        });
        y += h + GAP;
    });

    ctx.fillStyle = '#6b7080';
    ctx.font = font(600, 18);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText(footer, WIDTH - PAD, height - PAD);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
    });
}
