// Public mirror of a profile, so other players never read the private users/{uid} document.
//
//   publicProfiles/{uid}  small doc for lists (leaderboard, feed, follow lists, username lookup)
//   publicBanners/{uid}   the (large) cover image, read only on the profile page
//
// Synced from the signed-in user's profile (AppRuntime). Private profiles have no mirror.
import { firestore } from '../lib/firebase.js';

const FIELDS = ['username', 'accent', 'bannerPreset', 'bio', 'playing', 'platforms', 'genres', 'xp', 'level', 'bestStreak', 'streak', 'lastActiveDate', 'libraryStats', 'challengeBadges', 'socials'];

/** 64px JPEG thumbnail of a data-URL / URL avatar (a few KB instead of up to ~150 KB). */
export function makeAvatarThumb(src, size = 96) {
    return new Promise(resolve => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                const scale = Math.max(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return String(h);
}

const pick = profile => Object.fromEntries(FIELDS.filter(key => profile[key] !== undefined).map(key => [key, profile[key]]));

/** Writes (or removes) the public mirror when something public changed since the last sync on this device. */
export async function syncPublicProfile(user, profile) {
    if (!user?.uid || !profile?.username) return;
    const isPublic = profile.isPublic !== false;
    const publicData = pick(profile);
    const signature = hash(JSON.stringify([isPublic, publicData, profile.avatar?.length, profile.avatar?.slice(-64), profile.banner?.length, profile.banner?.slice(-64), profile.bannerPosY]));
    const storageKey = `gdh-public-sync-${user.uid}`;
    try {
        if (localStorage.getItem(storageKey) === signature) return;
    } catch {
        // storage unavailable: sync anyway
    }

    const { db, doc, setDoc, deleteDoc, serverTimestamp } = await firestore();
    if (!isPublic) {
        await Promise.all([
            deleteDoc(doc(db, 'publicProfiles', user.uid)),
            deleteDoc(doc(db, 'publicBanners', user.uid)),
        ]);
    } else {
        const avatarThumb = await makeAvatarThumb(profile.avatar);
        await setDoc(doc(db, 'publicProfiles', user.uid), {
            ...publicData,
            usernameLower: profile.username.trim().toLowerCase(),
            avatarThumb,
            hasBanner: Boolean(profile.banner),
            bannerPosY: profile.bannerPosY ?? 50,
            updatedAt: serverTimestamp(),
        });
        if (profile.banner) await setDoc(doc(db, 'publicBanners', user.uid), { banner: profile.banner, bannerPosY: profile.bannerPosY ?? 50 });
        else await deleteDoc(doc(db, 'publicBanners', user.uid));
    }
    try {
        localStorage.setItem(storageKey, signature);
    } catch {
        // storage unavailable
    }
}

/** Public mirror doc -> the profile shape the social components expect (avatar field). */
export const fromPublicDoc = (uid, data) => (data ? { uid, ...data, avatar: data.avatarThumb || null } : null);

export async function loadPublicBanner(uid) {
    const { db, doc, getDoc } = await firestore();
    const snap = await getDoc(doc(db, 'publicBanners', uid));
    return snap.exists() ? snap.data() : null;
}
