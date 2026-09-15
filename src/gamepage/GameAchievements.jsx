/* eslint-disable react/prop-types */
// "Achievements" on a game page: the Steam achievement list with global unlock rates for everyone,
// and the signed-in user's own progress from every synced platform (Steam app id or same title on Xbox / PlayStation).
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlaystation, FaSteam, FaXbox } from 'react-icons/fa';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import AchievementList from '../achievements/AchievementList.jsx';
import { findGameAchievements, getAchievementItems } from '../achievements/achievementsApi.js';

const PLATFORM_ICONS = { steam: FaSteam, xbox: FaXbox, psn: FaPlaystation };

function useMyAchievements(uid, steamAppId, name) {
    const [state, setState] = useState({ key: null, games: [], items: {} });
    const key = uid && (steamAppId || name) ? `${uid}|${steamAppId || ''}|${name || ''}` : null;

    useEffect(() => {
        if (!key) return undefined;
        let active = true;
        (async () => {
            const games = await findGameAchievements(uid, { steamAppId, name });
            const lists = await Promise.all(games.slice(0, 3).map(g => getAchievementItems(uid, g.gameKey).catch(() => [])));
            if (active) setState({ key, games, items: Object.fromEntries(games.slice(0, 3).map((g, i) => [g.gameKey, lists[i]])) });
        })().catch(error => {
            console.error('Could not load your achievements:', error);
            if (active) setState({ key, games: [], items: {} });
        });
        return () => { active = false; };
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- key covers uid / steamAppId / name

    return state.key === key ? state : { key, games: [], items: {}, loading: Boolean(key) };
}

export default function GameAchievements({ game }) {
    const { t, locale } = useT();
    const { user } = useContext(UserContext) || {};
    const appid = game?.steamAppId || null;
    const { data: steamData } = useApi(appid ? `${API_BASE}/steam/achievements/${appid}` : null);
    const mine = useMyAchievements(user?.uid, appid, game?.name);
    const [selected, setSelected] = useState(null);
    const nf = new Intl.NumberFormat(locale);

    const publicList = useMemo(() => (Array.isArray(steamData?.achievements) ? steamData.achievements : []), [steamData]);

    // Views: one per synced platform, plus the public Steam list when the user has no Steam progress for it
    const views = useMemo(() => {
        const list = mine.games.map(g => ({ id: g.gameKey, platform: g.platform, summary: g, items: mine.items[g.gameKey] || [] }));
        if (publicList.length && !list.some(v => v.platform === 'steam')) {
            list.push({ id: 'steam-public', platform: 'steam', summary: null, items: publicList });
        }
        return list;
    }, [mine, publicList]);

    if (!views.length) return null;
    const view = views.find(v => v.id === selected) || views[0];
    const summary = view.summary;
    const percent = summary?.total ? Math.round((summary.unlocked / summary.total) * 100) : 0;
    const hasSynced = mine.games.length > 0;

    return (
        <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="gh-section-title">{t('achievements.gamePanelTitle')}</h3>
                <Link to="/achievements" className="text-xs font-semibold text-[#c4b5fd] hover:text-white">{t('achievements.open')}</Link>
            </div>
            <div className="gh-surface p-4 sm:p-5 space-y-4">
                {views.length > 1 && (
                    <div className="flex flex-wrap gap-1.5">
                        {views.map(v => {
                            const Icon = PLATFORM_ICONS[v.platform] || FaSteam;
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setSelected(v.id)}
                                    className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${v.id === view.id ? 'bg-white text-[#0a0b0f]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                                >
                                    <Icon aria-hidden="true" /> {t(`profileExtras.platforms.${v.platform}`)}
                                    {v.summary ? ` · ${v.summary.unlocked}/${v.summary.total}` : ''}
                                </button>
                            );
                        })}
                    </div>
                )}

                {summary ? (
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                            <span className="text-white font-semibold">
                                {t('achievements.yourProgress', { unlocked: nf.format(summary.unlocked), total: nf.format(summary.total) })}
                            </span>
                            <span className="text-xs text-[#8a8f9c]">
                                {[
                                    `${percent}%`,
                                    summary.perfect ? t('achievements.perfectBadge') : null,
                                    summary.platform === 'xbox' && summary.pointsTotal ? `${nf.format(summary.points || 0)}/${nf.format(summary.pointsTotal)}G` : null,
                                    summary.trophies?.platinum ? t('achievements.platinumEarned') : null,
                                ].filter(Boolean).join(' · ')}
                            </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: summary.perfect ? '#34d399' : '#8b5cf6' }} />
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-[#a1a6b3]">
                        {t('achievements.publicCount', { count: nf.format(view.items.length) })}{' '}
                        {user ? (
                            !hasSynced && <Link to="/achievements" className="font-semibold text-[#c4b5fd] hover:text-white">{t('achievements.syncToSeeProgress')}</Link>
                        ) : (
                            <Link to="/login" className="font-semibold text-[#c4b5fd] hover:text-white">{t('achievements.loginToSeeProgress')}</Link>
                        )}
                    </p>
                )}

                {view.items.length > 0 ? (
                    <AchievementList key={view.id} items={view.items} showState={Boolean(summary)} initial={8} />
                ) : (
                    <p className="text-sm text-[#8a8f9c]">{t('achievements.countsOnly')}</p>
                )}
                {!summary && <p className="text-[11px] text-[#6b7080]">{t('achievements.steamSource')}</p>}
            </div>
        </section>
    );
}
