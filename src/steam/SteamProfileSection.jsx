/* eslint-disable react/prop-types */
// Steam account overview (Achievements page): level + XP, badges, account age, bans, recently played, friends.
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRepeat, BsBoxArrowUpRight, BsExclamationTriangle, BsShieldCheck, BsShieldExclamation } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { Spinner } from '../community/ui.jsx';
import { fetchSteamMe, steamErrorCode } from './steamApi.js';

const STATE_COLORS = { ingame: '#4ade80', online: '#60a5fa', busy: '#f87171', away: '#fbbf24', snooze: '#fbbf24', trade: '#60a5fa', play: '#60a5fa', offline: '#6b7080' };
const FRIENDS_PAGE = 12;

export default function SteamProfileSection() {
    const { t, locale } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [friendsShown, setFriendsShown] = useState(FRIENDS_PAGE);
    const steamId = profile?.steamId;
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

    const load = refresh => {
        setLoading(true);
        setError(null);
        fetchSteamMe(user, refresh)
            .then(setData)
            .catch(err => setError(steamErrorCode(err)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user && steamId) load(false);
    }, [user, steamId]); // eslint-disable-line react-hooks/exhaustive-deps -- load only depends on user

    if (!steamId) return null;

    return (
        <section>
            <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="gh-section-title">{t('steam.profileTitle')}</h2>
                <button type="button" onClick={() => load(true)} disabled={loading} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c4b5fd] hover:text-white disabled:opacity-50">
                    <BsArrowRepeat className={loading ? 'animate-spin' : ''} aria-hidden="true" /> {t('steam.refresh')}
                </button>
            </div>

            {error && (
                <p className="gh-surface flex items-start gap-2 p-4 text-sm text-[#fcd34d]">
                    <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" /> {t(`steam.errors.${error}`)}
                </p>
            )}
            {!data && loading && <Spinner className="py-8" />}

            {data && (
                <div className="grid gap-3 lg:grid-cols-3">
                    <ProfileCard data={data} nf={nf} />
                    <RecentlyPlayed games={data.recentlyPlayed} nf={nf} />
                    <Friends data={data} shown={friendsShown} onMore={() => setFriendsShown(n => n + 24)} />
                </div>
            )}
        </section>
    );
}

function ProfileCard({ data, nf }) {
    const { t, locale } = useT();
    const { profile, level, xp, badges, bans } = data;
    const years = profile.createdAt ? Math.floor((Date.now() - Date.parse(profile.createdAt)) / (365.25 * 86400000)) : null;
    const span = xp && xp.toNext != null && xp.currentLevelStart != null ? xp.total - xp.currentLevelStart + xp.toNext : null;
    const progress = span ? (xp.total - xp.currentLevelStart) / span : 0;
    const clean = bans && !bans.vac && !bans.game && !bans.community && !bans.economy;

    return (
        <div className="gh-surface p-4 space-y-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
                {profile.avatar && <img src={profile.avatar} alt="" className="h-14 w-14 rounded-lg shrink-0" />}
                <div className="min-w-0 flex-1">
                    <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-white hover:text-[#c4b5fd] min-w-0">
                        <span className="truncate">{profile.name}</span> <BsBoxArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: STATE_COLORS[profile.state] }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: STATE_COLORS[profile.state] }} aria-hidden="true" />
                        {profile.game ? t('steam.playing', { game: profile.game }) : t(`steam.state.${profile.state}`)}
                    </p>
                </div>
                {level != null && (
                    <div className="shrink-0 h-12 w-12 rounded-full border-2 border-[#c4b5fd] flex items-center justify-center" title={t('steam.level')}>
                        <span className="text-lg font-extrabold text-white">{level}</span>
                    </div>
                )}
            </div>

            {span > 0 && (
                <div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${Math.round(progress * 100)}%` }} />
                    </div>
                    <p className="text-[11px] text-[#8a8f9c] mt-1">{t('steam.xp', { xp: nf.format(xp.total), toNext: nf.format(xp.toNext), level: level + 1 })}</p>
                </div>
            )}

            <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/[0.03] py-2">
                    <dd className="text-base font-bold text-white">{badges.private ? '–' : nf.format(badges.count)}</dd>
                    <dt className="text-[10px] uppercase tracking-wide text-[#6b7080]">{t('steam.badges')}</dt>
                </div>
                <div className="rounded-lg bg-white/[0.03] py-2">
                    <dd className="text-base font-bold text-white">{data.friendCount != null ? nf.format(data.friendCount) : '–'}</dd>
                    <dt className="text-[10px] uppercase tracking-wide text-[#6b7080]">{t('steam.friends')}</dt>
                </div>
                <div className="rounded-lg bg-white/[0.03] py-2">
                    <dd className="text-base font-bold text-white">{years != null ? nf.format(years) : '–'}</dd>
                    <dt className="text-[10px] uppercase tracking-wide text-[#6b7080]">{t('steam.years')}</dt>
                </div>
            </dl>

            {profile.createdAt && <p className="text-[11px] text-[#6b7080]">{t('steam.memberSince', { date: new Date(profile.createdAt).toLocaleDateString(locale) })}</p>}

            {bans && (
                <p className={`flex items-center gap-1.5 text-xs ${clean ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                    {clean ? <BsShieldCheck aria-hidden="true" /> : <BsShieldExclamation aria-hidden="true" />}
                    {clean ? t('steam.noBans') : t('steam.bans', { vac: bans.vac, game: bans.game })}
                </p>
            )}

            {badges.recent?.length > 0 && (
                <div>
                    <p className="gh-eyebrow mb-1.5">{t('steam.recentBadges')}</p>
                    <ul className="flex flex-wrap gap-1.5">
                        {badges.recent.map(badge => (
                            <li key={`${badge.badgeId}:${badge.appid || ''}`} className="gh-chip text-[11px]" title={badge.completedAt ? new Date(badge.completedAt).toLocaleDateString(locale) : undefined}>
                                {badge.appid ? t('steam.gameBadge', { level: badge.level }) : t('steam.communityBadge', { id: badge.badgeId })} · {nf.format(badge.xp)} XP
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function RecentlyPlayed({ games, nf }) {
    const { t } = useT();
    return (
        <div className="gh-surface p-4 min-w-0">
            <p className="gh-eyebrow mb-2">{t('steam.recentlyPlayed')}</p>
            {games == null ? (
                <p className="text-sm text-[#8a8f9c]">{t('steam.privateGames')}</p>
            ) : games.length === 0 ? (
                <p className="text-sm text-[#8a8f9c]">{t('steam.noRecent')}</p>
            ) : (
                <ul className="space-y-2">
                    {games.map(game => (
                        <li key={game.appid}>
                            <Link to={`/game/steam/${game.appid}`} className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-white/[0.03] min-w-0">
                                <img src={game.image} alt="" loading="lazy" className="h-9 w-[76px] rounded object-cover shrink-0 bg-white/[0.04]" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-white">{game.name}</span>
                                    <span className="block text-[11px] text-[#8a8f9c]">{t('steam.twoWeeks', { hours: nf.format(game.hours2Weeks), total: nf.format(game.hoursTotal) })}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Friends({ data, shown, onMore }) {
    const { t } = useT();
    const friends = data.friends;
    const online = friends ? friends.filter(f => f.state !== 'offline').length : 0;
    return (
        <div className="gh-surface p-4 min-w-0">
            <p className="gh-eyebrow mb-2">{friends ? t('steam.friendsOnline', { online, total: data.friendCount }) : t('steam.friends')}</p>
            {!friends ? (
                <p className="text-sm text-[#8a8f9c]">{t('steam.privateFriends')}</p>
            ) : friends.length === 0 ? (
                <p className="text-sm text-[#8a8f9c]">{t('steam.noFriends')}</p>
            ) : (
                <>
                    <ul className="space-y-1.5 max-h-80 overflow-y-auto pr-1" data-lenis-prevent>
                        {friends.slice(0, shown).map(friend => (
                            <li key={friend.steamId}>
                                <a href={friend.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-white/[0.03] min-w-0">
                                    <span className="relative shrink-0">
                                        {friend.avatar ? <img src={friend.avatar} alt="" loading="lazy" className="h-8 w-8 rounded" /> : <span className="block h-8 w-8 rounded bg-white/[0.06]" />}
                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111319]" style={{ background: STATE_COLORS[friend.state] }} aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm text-white">{friend.name}</span>
                                        <span className="block truncate text-[11px]" style={{ color: friend.game ? STATE_COLORS.ingame : '#8a8f9c' }}>
                                            {friend.game ? t('steam.playing', { game: friend.game }) : t(`steam.state.${friend.state}`)}
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    {friends.length > shown && (
                        <button type="button" onClick={onMore} className="mt-2 text-xs font-semibold text-[#c4b5fd] hover:text-white">
                            {t('steam.moreFriends', { count: friends.length - shown })}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
