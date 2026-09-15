// Firestore access for shared Dead by Daylight builds (collection "builds").
import { firestore, toDate } from '../lib/firebase.js';

export const ROLES = ['survivor', 'killer'];
export const BUILD_TAGS = ['meta', 'fun', 'beginner', 'chase', 'gen-rush', 'stealth', 'aura', 'healing', 'altruism', 'slowdown', 'anti-heal', 'endgame'];
export const MAX_TAGS = 5;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 500;
export const DAILY_LIMIT = 10;
export const FETCH_LIMIT = 300;
export const REPORT_REASONS = ['spam', 'offensive', 'misleading', 'other'];

const DAY_MS = 24 * 60 * 60 * 1000;

const fromSnap = snap => ({ id: snap.id, ...snap.data() });

/** Latest (sort 'new') or most liked (sort 'top') builds. Single-field order -> no composite index. */
export async function fetchBuilds(sort) {
    const { db, collection, query, orderBy, limit, getDocs } = await firestore();
    const field = sort === 'top' ? 'likeCount' : 'createdAt';
    const snap = await getDocs(query(collection(db, 'builds'), orderBy(field, 'desc'), limit(FETCH_LIMIT)));
    return snap.docs.map(fromSnap);
}

export async function fetchBuild(id) {
    const { db, doc, getDoc } = await firestore();
    const snap = await getDoc(doc(db, 'builds', id));
    return snap.exists() ? fromSnap(snap) : null;
}

/** { [buildId]: boolean } – whether uid liked each build. */
export async function fetchLiked(uid, ids) {
    if (!uid || !ids.length) return {};
    const { db, doc, getDoc } = await firestore();
    const entries = await Promise.all(ids.map(async id => {
        try {
            const snap = await getDoc(doc(db, 'builds', id, 'likes', uid));
            return [id, snap.exists()];
        } catch {
            return [id, false];
        }
    }));
    return Object.fromEntries(entries);
}

/** Like / unlike in one transaction with the likeCount counter. Resolves to the new liked state. */
export async function toggleLike(buildId, uid) {
    const { db, doc, runTransaction, serverTimestamp, increment } = await firestore();
    const buildRef = doc(db, 'builds', buildId);
    const likeRef = doc(db, 'builds', buildId, 'likes', uid);
    return runTransaction(db, async tx => {
        const like = await tx.get(likeRef);
        if (like.exists()) {
            tx.delete(likeRef);
            tx.update(buildRef, { likeCount: increment(-1) });
            return false;
        }
        tx.set(likeRef, { createdAt: serverTimestamp() });
        tx.update(buildRef, { likeCount: increment(1) });
        return true;
    });
}

/** How many builds uid created in the last 24 hours (equality query, filtered in memory). */
export async function countRecentBuilds(uid) {
    const { db, collection, query, where, getDocs } = await firestore();
    const snap = await getDocs(query(collection(db, 'builds'), where('uid', '==', uid)));
    const since = Date.now() - DAY_MS;
    return snap.docs.filter(d => {
        const created = toDate(d.data().createdAt);
        return !created || created.getTime() >= since; // pending server timestamps count too
    }).length;
}

export async function createBuild(user, profile, { role, character, perks, title, description, tags }) {
    const { db, collection, addDoc, serverTimestamp } = await firestore();
    const data = {
        uid: user.uid,
        username: profile?.username || null,
        game: 'dbd',
        role,
        character: character || null,
        perks: perks.map(p => ({ name: p.name, image: p.image })),
        title: title.trim().slice(0, TITLE_MAX),
        description: description.trim().slice(0, DESCRIPTION_MAX),
        tags: tags.filter(tag => BUILD_TAGS.includes(tag)).slice(0, MAX_TAGS),
        likeCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'builds'), data);
    return { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() };
}

export async function deleteBuild(id) {
    const { db, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(db, 'builds', id));
}

export async function reportBuild(uid, buildId, reason) {
    const { db, collection, addDoc, serverTimestamp } = await firestore();
    await addDoc(collection(db, 'reports'), {
        type: 'build',
        targetId: buildId,
        reason: String(reason || '').trim().slice(0, 300),
        uid,
        createdAt: serverTimestamp(),
    });
}

export const buildUrl = id => `${window.location.origin}/builds?id=${encodeURIComponent(id)}`;

/** Plain-text build for the clipboard. labels: { role, perks } already translated. */
export function buildText(build, { roleLabel, perksLabel }) {
    const head = `${build.title} — ${roleLabel}${build.character ? ` (${build.character})` : ''}`;
    const lines = [head, `${perksLabel}: ${(build.perks || []).map(p => p.name).join(', ')}`];
    if (build.tags?.length) lines.push(build.tags.map(tag => `#${tag}`).join(' '));
    lines.push(buildUrl(build.id));
    return lines.join('\n');
}

/** Copies text; resolves true on success. */
export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand('copy');
            area.remove();
            return ok;
        } catch {
            return false;
        }
    }
}

/** Smaller wiki thumbnail for a Fandom perk icon. */
export function perkThumb(url, width = 96) {
    if (typeof url !== 'string' || !url.includes('static.wikia.nocookie.net') || url.includes('/revision/')) return url;
    return `${url}/revision/latest/scale-to-width-down/${width}`;
}
