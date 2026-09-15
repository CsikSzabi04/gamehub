// Server status page helpers: live service status, community outage reports, following services.
//
// Firestore:
//   outageReports/{id}   { service, uid, createdAt }   – signed-in users create (1 per user/service per 30 min,
//                                                         checked client-side); everyone reads recent ones for counts
//   users/{uid}.followedServices: string[]              – service ids; the backend statusAlerts job notifies followers
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../Components/apiCache.js';
import { apiGet } from '../lib/api.js';
import { firestore, toDate } from '../lib/firebase.js';

export const REFRESH_MS = 60 * 1000;
export const REPORT_COOLDOWN_MS = 30 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
export const BUCKETS = 12;

export const POPULAR_APPIDS = [730, 570, 578080, 1172470, 252490, 440];
export const CATEGORIES = ['platform', 'game', 'chat'];
export const ISSUE_STATES = ['degraded', 'partial_outage', 'major_outage'];

/** Colors per service status. */
export const STATUS_STYLES = {
    operational: { dot: '#22c55e', text: 'text-[#86efac]', ring: 'border-white/[0.06]' },
    degraded: { dot: '#eab308', text: 'text-[#fde047]', ring: 'border-[#eab308]/30' },
    partial_outage: { dot: '#f97316', text: 'text-[#fdba74]', ring: 'border-[#f97316]/35' },
    major_outage: { dot: '#ef4444', text: 'text-[#fca5a5]', ring: 'border-[#ef4444]/45' },
    maintenance: { dot: '#60a5fa', text: 'text-[#93c5fd]', ring: 'border-[#60a5fa]/30' },
    unknown: { dot: '#6b7080', text: 'text-[#a1a6b3]', ring: 'border-white/[0.06]' },
};

export const statusStyle = status => STATUS_STYLES[status] || STATUS_STYLES.unknown;

const STORAGE_KEY = 'gdh-status-services:v1';
const REPORTS_KEY = 'gdh-outage-reports';

function readJson(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage unavailable
    }
}

/** Live /status/services data, refreshed every minute while the page is visible. */
export function useServiceStatus() {
    const [state, setState] = useState(() => ({ data: readJson(STORAGE_KEY), error: null, refreshing: false }));
    const lastLoad = useRef(0);

    const load = useCallback(async () => {
        lastLoad.current = Date.now();
        setState(s => ({ ...s, refreshing: true }));
        try {
            const data = await apiGet('/status/services');
            if (!Array.isArray(data?.services)) throw new Error('Invalid response');
            writeJson(STORAGE_KEY, data);
            setState({ data, error: null, refreshing: false });
        } catch (error) {
            setState(s => ({ ...s, error, refreshing: false }));
        }
    }, []);

    useEffect(() => {
        load();
        const tick = () => {
            if (document.visibilityState === 'visible' && Date.now() - lastLoad.current >= REFRESH_MS - 1000) load();
        };
        const timer = setInterval(tick, REFRESH_MS);
        document.addEventListener('visibilitychange', tick);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [load]);

    return { ...state, reload: load };
}

/** Community reports of the last hour, grouped per service: { [service]: { count, buckets, lastMine } } */
export function useOutageReports(uid) {
    const [reports, setReports] = useState([]);

    const load = useCallback(async () => {
        try {
            const { db, collection, query, where, limit, getDocs } = await firestore();
            const since = new Date(Date.now() - HOUR_MS);
            const snap = await getDocs(query(collection(db, 'outageReports'), where('createdAt', '>', since), limit(500)));
            setReports(snap.docs.map(d => {
                const data = d.data();
                return { service: data.service, uid: data.uid, at: toDate(data.createdAt)?.getTime() || Date.now() };
            }));
        } catch (error) {
            console.error('Could not load outage reports:', error);
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') load();
        }, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    const now = Date.now();
    const byService = {};
    for (const report of reports) {
        if (!report.service || now - report.at > HOUR_MS) continue;
        const entry = (byService[report.service] ||= { count: 0, buckets: new Array(BUCKETS).fill(0), lastMine: 0 });
        entry.count++;
        const index = Math.min(BUCKETS - 1, Math.max(0, BUCKETS - 1 - Math.floor((now - report.at) / (HOUR_MS / BUCKETS))));
        entry.buckets[index]++;
        if (uid && report.uid === uid) entry.lastMine = Math.max(entry.lastMine, report.at);
    }

    const addLocal = useCallback((service, reporterUid) => {
        setReports(list => [...list, { service, uid: reporterUid, at: Date.now() }]);
    }, []);

    return { byService, reload: load, addLocal };
}

export function lastLocalReport(service) {
    return Number(readJson(REPORTS_KEY)?.[service] || 0);
}

/** Writes one outage report. Returns 'ok' | 'cooldown'. */
export async function sendOutageReport(user, service, lastMine = 0) {
    if (!user?.uid) throw new Error('Not signed in');
    const last = Math.max(lastLocalReport(service), lastMine);
    if (Date.now() - last < REPORT_COOLDOWN_MS) return 'cooldown';
    const { db, collection, addDoc, serverTimestamp } = await firestore();
    await addDoc(collection(db, 'outageReports'), {
        service: String(service).slice(0, 40),
        uid: user.uid,
        createdAt: serverTimestamp(),
    });
    const stored = readJson(REPORTS_KEY) || {};
    // Keep only fresh entries
    for (const key of Object.keys(stored)) if (Date.now() - stored[key] > REPORT_COOLDOWN_MS) delete stored[key];
    writeJson(REPORTS_KEY, { ...stored, [service]: Date.now() });
    return 'ok';
}

/** Adds/removes a service id in users/{uid}.followedServices and updates the in-memory profile. */
export async function setFollowService(user, setProfile, service, follow) {
    if (!user?.uid) throw new Error('Not signed in');
    const { db, doc, setDoc, arrayUnion, arrayRemove } = await firestore();
    await setDoc(doc(db, 'users', user.uid), { followedServices: follow ? arrayUnion(service) : arrayRemove(service) }, { merge: true });
    setProfile?.(prev => {
        const current = Array.isArray(prev?.followedServices) ? prev.followedServices : [];
        const next = follow ? [...new Set([...current, service])] : current.filter(id => id !== service);
        return { ...(prev || {}), followedServices: next };
    });
}

/** Steam app ids from users/{uid}/library (source 'steam'), most relevant first. */
export async function librarySteamGames(uid, max = 12) {
    const { db, collection, query, where, limit, getDocs } = await firestore();
    const snap = await getDocs(query(collection(db, 'users', uid, 'library'), where('source', '==', 'steam'), limit(400)));
    const rank = { playing: 0, backlog: 1, wishlist: 2, completed: 3, dropped: 4 };
    return snap.docs
        .map(d => d.data())
        .filter(item => /^\d{1,8}$/.test(String(item.sourceId || '')))
        .sort((a, b) =>
            (rank[a.status] ?? 5) - (rank[b.status] ?? 5)
            || String(b.lastPlayed || '').localeCompare(String(a.lastPlayed || ''))
            || (b.steamPlaytimeHours || 0) - (a.steamPlaytimeHours || 0))
        .slice(0, max)
        .map(item => ({ appid: Number(item.sourceId), name: item.name || null }));
}

export const patchNotesUrl = appids => `${API_BASE}/status/patchnotes?appids=${[...new Set(appids)].sort((a, b) => a - b).join(',')}`;

export const toPatchItems = raw => (Array.isArray(raw?.items) ? raw.items : []);
