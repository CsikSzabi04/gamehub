import { Link } from 'react-router-dom';
import { BsBell, BsCollection, BsGlobe2, BsLock, BsPeople, BsTag, BsTrophy } from 'react-icons/bs';
import { useT } from '../../i18n/index.jsx';

/** Shortcuts from the own profile to the community features. */
export default function ProfileQuickLinks({ profile }) {
    const { t } = useT();
    const username = profile?.username;
    const isPublic = profile?.isPublic !== false;

    const links = [
        username && { to: `/u/${encodeURIComponent(username)}`, icon: isPublic ? BsGlobe2 : BsLock, label: t('profileExtras.publicProfile'), hint: isPublic ? t('profileExtras.publicOn') : t('profileExtras.publicOff') },
        { to: '/library', icon: BsCollection, label: t('profileExtras.library'), hint: profile?.libraryStats?.total ? t('profileExtras.libraryCount', { count: profile.libraryStats.total }) : t('profileExtras.libraryHint') },
        { to: '/achievements', icon: BsTrophy, label: t('achievements.title'), hint: profile?.achievementStats?.unlocked ? t('achievements.unlockedCount', { count: profile.achievementStats.unlocked }) : t('achievements.quickHint') },
        { to: '/alerts', icon: BsTag, label: t('profileExtras.alerts'), hint: t('profileExtras.alertsHint') },
        { to: '/notifications#settings', icon: BsBell, label: t('profileExtras.notifications'), hint: t('profileExtras.notificationsHint') },
        { to: '/community', icon: BsPeople, label: t('profileExtras.community'), hint: t('profileExtras.communityHint') },
    ].filter(Boolean);

    return (
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4" aria-label={t('profileExtras.shortcuts')}>
            {links.map(({ to, icon: Icon, label, hint }) => (
                <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] px-3 py-3 transition-colors min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white truncate">{label}</span>
                        <span className="block text-[11px] text-gray-500 truncate">{hint}</span>
                    </span>
                </Link>
            ))}
        </nav>
    );
}
