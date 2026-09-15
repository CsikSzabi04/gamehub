import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { fetchFollowingUids } from './useFollow.js';
import { levelInfoOf, loadTopUsers } from './profiles.js';
import UserRow from './UserRow.jsx';

/** "Who to follow" card: highest XP public players you don't follow yet. */
export default function WhoToFollow({ max = 5, className = '' }) {
    const { user, authReady } = useContext(UserContext) || {};
    const { t, locale } = useT();
    const [list, setList] = useState(null);
    const uid = user?.uid;

    useEffect(() => {
        if (!authReady) return undefined;
        let alive = true;
        Promise.all([loadTopUsers('xp'), fetchFollowingUids(uid)])
            .then(([top, followed]) => {
                if (!alive) return;
                const skip = new Set([...followed, uid]);
                setList(top.filter(p => !skip.has(p.uid)).slice(0, max));
            })
            .catch(() => alive && setList([]));
        return () => { alive = false; };
    }, [authReady, uid, max]);

    if (list && list.length === 0) return null;

    return (
        <section className={`gh-surface p-4 sm:p-5 ${className}`}>
            <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-base font-bold text-white">{t('social.whoToFollow.title')}</h2>
                <Link to="/leaderboard" className="text-xs text-[#a1a6b3] hover:text-white">{t('social.whoToFollow.leaderboard')}</Link>
            </div>
            {list === null ? (
                <div className="space-y-3 py-2">
                    {[0, 1, 2].map(i => <div key={i} className="h-10 rounded-lg bg-white/[0.04] animate-pulse" />)}
                </div>
            ) : (
                <div className="divide-y divide-white/[0.06]">
                    {list.map(p => (
                        <UserRow key={p.uid} profile={p} meta={t('social.xpValue', { xp: new Intl.NumberFormat(locale).format(levelInfoOf(p).xp) })} />
                    ))}
                </div>
            )}
        </section>
    );
}
