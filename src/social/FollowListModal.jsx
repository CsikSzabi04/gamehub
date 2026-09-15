import { useEffect, useState } from 'react';
import { BsPeople } from 'react-icons/bs';
import { Modal, Spinner } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { loadFollowList } from './useFollow.js';
import { fetchProfiles, isPublicProfile } from './profiles.js';
import UserRow from './UserRow.jsx';

const PAGE = 30;

/** Followers / following list. kind: 'followers' | 'following' | null (closed). */
export default function FollowListModal({ uid, kind, username, onClose }) {
    const { t } = useT();
    const [entries, setEntries] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [shown, setShown] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (!uid || !kind) return undefined;
        let alive = true;
        setEntries(null);
        setProfiles([]);
        setShown(0);
        loadFollowList(uid, kind)
            .then(list => alive && setEntries(list))
            .catch(() => alive && setEntries([]));
        return () => { alive = false; };
    }, [uid, kind]);

    useEffect(() => {
        if (!entries || shown > 0 || !entries.length) return undefined;
        let alive = true;
        const first = entries.slice(0, PAGE).map(e => e.uid);
        fetchProfiles(first).then(map => {
            if (!alive) return;
            setProfiles(first.map(id => map.get(id)).filter(p => p?.username && isPublicProfile(p)));
            setShown(first.length);
        });
        return () => { alive = false; };
    }, [entries, shown]);

    async function showMore() {
        setLoadingMore(true);
        const next = entries.slice(shown, shown + PAGE).map(e => e.uid);
        const map = await fetchProfiles(next);
        setProfiles(prev => [...prev, ...next.map(id => map.get(id)).filter(p => p?.username && isPublicProfile(p))]);
        setShown(shown + next.length);
        setLoadingMore(false);
    }

    const loading = entries === null || (entries.length > 0 && shown === 0);

    return (
        <Modal
            open={Boolean(kind)}
            onClose={onClose}
            title={kind === 'followers' ? t('social.profile.followers') : t('social.profile.following')}
            subtitle={username}
        >
            {loading ? (
                <Spinner className="py-10" />
            ) : profiles.length === 0 ? (
                <div className="text-center py-10">
                    <BsPeople className="mx-auto text-[#3a3f4b] text-3xl mb-3" aria-hidden="true" />
                    <p className="text-sm text-[#a1a6b3]">{kind === 'followers' ? t('social.profile.noFollowers') : t('social.profile.noFollowing')}</p>
                </div>
            ) : (
                <div className="divide-y divide-white/[0.06] -my-2">
                    {profiles.map(p => <UserRow key={p.uid} profile={p} onNavigate={onClose} />)}
                </div>
            )}
            {!loading && entries && shown < entries.length && (
                <button type="button" onClick={showMore} disabled={loadingMore} className="gh-btn gh-btn-secondary w-full mt-4">
                    {t('social.showMore')}
                </button>
            )}
        </Modal>
    );
}
