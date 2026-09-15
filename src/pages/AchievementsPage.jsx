/* eslint-disable react/prop-types */
// /achievements: levels, badges and every synced achievement / trophy from Steam, Xbox and PlayStation.
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRepeat, BsChevronDown, BsExclamationTriangle, BsSearch, BsTrophy } from 'react-icons/bs';
import { FaClock, FaLock, FaPlaystation, FaSteam, FaTrophy, FaXbox } from 'react-icons/fa';
import { EmptyState, Modal, PageShell, RequireLogin, Spinner, Tabs, inputClass } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { useLibrary } from '../library/useLibrary.js';
import { fetchSteamOwned, saveSteamId } from '../library/libraryApi.js';
import { gameHref } from '../lib/games.js';
import { LevelBar } from '../Components/profile/GamerProgressCard.jsx';
import AchievementList, { RarityChip } from '../achievements/AchievementList.jsx';
import ConnectKeyModal from '../achievements/ConnectKeyModal.jsx';
import SteamProfileSection from '../steam/SteamProfileSection.jsx';
import {
    SYNC_PLATFORMS, disconnectPlatform, errorCodeOf, getAchievementItems, getSyncConfig, isSyncRunning,
    startSync, useAchievementGames, useAchievementOverview,
} from '../achievements/achievementsApi.js';
import {
    PSN_TROPHY_COLORS, evaluateGamerBadges, gamerStats, hunterLevel, playtimeLevel,
} from '../achievements/gamerProgress.js';

const PLATFORM_META = {
    steam: { icon: FaSteam, color: '#c7d5e0' },
    xbox: { icon: FaXbox, color: '#22c55e' },
    psn: { icon: FaPlaystation, color: '#3b82f6' },
};
const GAMES_PAGE = 30;

function useRelativeTime() {
    const { locale } = useT();
    return useMemo(() => {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return value => {
            const time = Date.parse(value || '');
            if (!time) return '';
            const minutes = Math.round((time - Date.now()) / 60000);
            if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
            const hours = Math.round(minutes / 60);
            if (Math.abs(hours) < 48) return rtf.format(hours, 'hour');
            return rtf.format(Math.round(hours / 24), 'day');
        };
    }, [locale]);
}

export default function AchievementsPage() {
    const { t } = useT();
    return (
        <PageShell eyebrow={t('achievements.eyebrow')} title={t('achievements.title')} subtitle={t('achievements.subtitle')}>
            <RequireLogin>
                <Dashboard />
            </RequireLogin>
        </PageShell>
    );
}

function Dashboard() {
    const { t } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const { stats, sync, loading: overviewLoading } = useAchievementOverview(user.uid);
    const { games, loading: gamesLoading } = useAchievementGames(user.uid);
    const { items: libraryItems } = useLibrary();
    const [config, setConfig] = useState(null);

    useEffect(() => {
        let active = true;
        getSyncConfig()
            .then(data => active && setConfig(data))
            .catch(error => active && setConfig({ unavailable: true, notDeployed: error?.status === 404 }));
        return () => { active = false; };
    }, []);

    const gamer = useMemo(() => gamerStats({ ...profile, achievementStats: stats, platformSync: sync }, libraryItems), [profile, stats, sync, libraryItems]);

    if (overviewLoading) return <Spinner />;

    return (
        <div className="space-y-8">
            {config?.unavailable && (
                <p className="flex items-start gap-2 rounded-xl border border-[#fbbf24]/25 bg-[#fbbf24]/[0.07] p-4 text-sm text-[#fcd34d]">
                    <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                    {t(config.notDeployed ? 'achievements.errors.not_deployed' : 'achievements.errors.upstream')}
                </p>
            )}

            <Overview gamer={gamer} stats={stats} />

            <section>
                <h2 className="gh-section-title mb-3">{t('achievements.platformsTitle')}</h2>
                <div className="grid gap-3 md:grid-cols-3">
                    {SYNC_PLATFORMS.map(platform => (
                        <PlatformCard key={platform} platform={platform} sync={sync?.[platform]} config={config} />
                    ))}
                </div>
            </section>

            <SteamProfileSection />

            {stats?.recent?.length > 0 && <UnlockStrip title={t('achievements.recentTitle')} items={stats.recent} />}
            {stats?.rarest?.length > 0 && <UnlockStrip title={t('achievements.rarestTitle')} items={stats.rarest} />}

            <GamesSection uid={user.uid} games={games} loading={gamesLoading} />

            <BadgesSection gamer={gamer} />
        </div>
    );
}

/* ───────── Levels + numbers ───────── */

function Overview({ gamer, stats }) {
    const { t, locale } = useT();
    const nf = new Intl.NumberFormat(locale);
    const hunter = hunterLevel(gamer.hunterPoints);
    const playtime = playtimeLevel(gamer.hoursPlayed);
    const completion = gamer.achievementsTotal ? Math.round((gamer.achievements / gamer.achievementsTotal) * 100) : 0;
    const trophies = stats?.trophies || {};
    const hasTrophies = Object.values(trophies).some(Boolean);

    const tiles = [
        { key: 'achievements', value: nf.format(gamer.achievements), sub: gamer.achievementsTotal ? t('achievements.ofTotal', { total: nf.format(gamer.achievementsTotal), percent: completion }) : null },
        { key: 'perfect', value: nf.format(gamer.perfectGames) },
        { key: 'rare', value: nf.format(gamer.rareAchievements), sub: t('achievements.rareHint') },
        { key: 'ultraRare', value: nf.format(gamer.ultraRareAchievements), sub: t('achievements.ultraRareHint') },
        { key: 'gamerscore', value: nf.format(gamer.gamerscore) },
        { key: 'hours', value: nf.format(gamer.hoursPlayed), sub: t('achievements.hoursHint') },
    ];

    return (
        <section className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <LevelBar icon={FaTrophy} label={t('achievements.hunterLevel')} info={hunter} color="#fbbf24" valueText={`${t('achievements.points', { points: nf.format(gamer.hunterPoints) })} · ${t('achievements.pointsToNext', { points: nf.format(hunter.toNext), level: hunter.level + 1 })}`} />
                <LevelBar icon={FaClock} label={t('achievements.playtimeLevel')} info={playtime} color="#a78bfa" valueText={t('achievements.hoursToNext', { hours: nf.format(Math.ceil(playtime.toNext)), level: playtime.level + 1 })} />
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {tiles.map(tile => (
                    <div key={tile.key} className="gh-surface px-3 py-3 min-w-0">
                        <dd className="text-xl font-extrabold text-white truncate">{tile.value}</dd>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8f9c] truncate">{t(`achievements.stats.${tile.key}`)}</dt>
                        {tile.sub && <p className="text-[11px] text-[#6b7080] mt-0.5 truncate">{tile.sub}</p>}
                    </div>
                ))}
            </dl>
            {hasTrophies && (
                <div className="gh-surface px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white"><FaPlaystation className="text-[#3b82f6]" aria-hidden="true" /> {t('achievements.trophiesTitle')}</span>
                    {['platinum', 'gold', 'silver', 'bronze'].map(type => (
                        <span key={type} className="flex items-center gap-1.5 text-sm text-[#c9ccd4]">
                            <span className="h-3 w-3 rounded-full" style={{ background: PSN_TROPHY_COLORS[type] }} aria-hidden="true" />
                            <span className="font-bold text-white">{nf.format(trophies[type] || 0)}</span> {t(`achievements.trophy.${type}`)}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}

/* ───────── Platform cards ───────── */

function PlatformCard({ platform, sync, config }) {
    const { t, locale } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const relative = useRelativeTime();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [keyModal, setKeyModal] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [removeData, setRemoveData] = useState(true);
    const [steamInput, setSteamInput] = useState('');
    const { icon: Icon, color } = PLATFORM_META[platform];
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

    const running = isSyncRunning(sync);
    const hasSteamId = Boolean(profile?.steamId);
    const connected = platform === 'steam' ? hasSteamId : Boolean(sync?.autoSync || sync?.lastSyncAt);
    const unavailable = config?.unavailable || (platform === 'steam' && config && config.steam === false);

    const runSync = async () => {
        setBusy(true);
        setError(null);
        try {
            await startSync(user, platform);
        } catch (err) {
            const code = errorCodeOf(err);
            if (code === 'no_credentials') setKeyModal(true);
            else setError(code);
        } finally {
            setBusy(false);
        }
    };

    const linkSteam = async event => {
        event.preventDefault();
        if (!steamInput.trim() || busy) return;
        setBusy(true);
        setError(null);
        try {
            const data = await fetchSteamOwned(steamInput);
            await saveSteamId(user.uid, data.steamId);
            setProfile?.(current => (current ? { ...current, steamId: data.steamId } : current));
            setSteamInput('');
            await startSync(user, 'steam');
        } catch (err) {
            const code = err?.data?.code;
            setError(code === 'invalid_profile' || code === 'not_found' ? 'no_account' : errorCodeOf(err));
        } finally {
            setBusy(false);
        }
    };

    const disconnect = async () => {
        setBusy(true);
        try {
            await disconnectPlatform(user, platform, removeData);
            setDisconnecting(false);
        } catch (err) {
            setError(errorCodeOf(err));
        } finally {
            setBusy(false);
        }
    };

    const account = [];
    if (platform === 'steam' && sync?.gameCount) account.push(t('achievements.account.steam', { games: nf.format(sync.gameCount), hours: nf.format(Math.round(sync.totalHours || 0)) }));
    if (platform === 'xbox' && sync?.gamertag) account.push(`${sync.gamertag} · ${nf.format(sync.gamerscore || 0)}G`);
    if (platform === 'psn' && sync?.trophyLevel) account.push(t('achievements.account.psn', { level: sync.trophyLevel }));

    const shownError = error || (sync?.status === 'error' && !running ? errorCodeOf(sync.error) : null);

    return (
        <div className={`gh-surface p-4 flex flex-col gap-3 min-w-0 ${connected ? 'ring-1 ring-emerald-500/20' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white/5 shrink-0"><Icon className="w-5 h-5" style={{ color }} aria-hidden="true" /></div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{t(`profileExtras.platforms.${platform}`)}</p>
                    <p className="text-[11px] text-[#8a8f9c] truncate">
                        {running
                            ? t('achievements.status.running', { done: sync?.done || 0, total: sync?.total || 0 })
                            : sync?.lastSyncAt
                                ? t('achievements.status.lastSync', { time: relative(sync.lastSyncAt) })
                                : connected ? t('achievements.status.neverSynced') : t('achievements.status.notConnected')}
                    </p>
                </div>
                {running && <BsArrowRepeat className="h-4 w-4 text-[#c4b5fd] animate-spin shrink-0" aria-hidden="true" />}
            </div>

            {account.length > 0 && <p className="text-xs text-[#c9ccd4] truncate">{account.join(' · ')}</p>}
            {connected && (
                <p className="text-[11px] text-[#6b7080]">
                    {platform === 'steam' || sync?.autoSync ? t('achievements.status.autoOn') : t('achievements.status.autoOff')}
                    {sync?.partial && !running ? ` · ${t('achievements.status.partial')}` : ''}
                </p>
            )}

            {shownError && (
                <p className="flex items-start gap-2 text-xs text-[#fcd34d]">
                    <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                    {t(`achievements.errors.${shownError}`)}
                </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2">
                {platform === 'steam' && !hasSteamId ? (
                    <form onSubmit={linkSteam} className="flex w-full gap-2">
                        <input
                            value={steamInput}
                            onChange={e => setSteamInput(e.target.value.slice(0, 200))}
                            placeholder={t('achievements.steamPlaceholder')}
                            className={inputClass}
                            disabled={unavailable}
                        />
                        <button type="submit" disabled={busy || unavailable || !steamInput.trim()} className="gh-btn gh-btn-primary shrink-0 !h-10">{t('achievements.link')}</button>
                    </form>
                ) : platform !== 'steam' && !sync?.autoSync ? (
                    <button type="button" onClick={() => setKeyModal(true)} disabled={unavailable} className="gh-btn gh-btn-primary !h-9">
                        {connected ? t('achievements.syncWithKey') : t('achievements.connectButton')}
                    </button>
                ) : (
                    <button type="button" onClick={runSync} disabled={busy || running || unavailable} className="gh-btn gh-btn-primary !h-9">
                        <BsArrowRepeat aria-hidden="true" /> {running ? t('achievements.syncing') : t('achievements.syncNow')}
                    </button>
                )}
                {connected && (
                    <button type="button" onClick={() => { setRemoveData(true); setDisconnecting(true); }} disabled={busy || running} className="ml-auto text-[11px] font-semibold text-red-400/80 hover:text-red-300">
                        {t('achievements.disconnect')}
                    </button>
                )}
            </div>

            {platform !== 'steam' && (
                <ConnectKeyModal platform={platform} open={keyModal} onClose={() => setKeyModal(false)} autoSyncAvailable={config?.autoSync !== false} onStarted={() => setError(null)} />
            )}

            <Modal open={disconnecting} onClose={() => !busy && setDisconnecting(false)} title={t('achievements.disconnectTitle', { platform: t(`profileExtras.platforms.${platform}`) })} subtitle={t('achievements.disconnectText')} maxWidth="max-w-md">
                <div className="space-y-4">
                    <label className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 cursor-pointer">
                        <input type="checkbox" checked={removeData} onChange={e => setRemoveData(e.target.checked)} className="mt-0.5 accent-[#ef4444]" />
                        <span className="text-sm text-[#c9ccd4]">{t('achievements.disconnectRemove')}</span>
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDisconnecting(false)} disabled={busy} className="gh-btn gh-btn-secondary !h-10">{t('common.cancel')}</button>
                        <button type="button" onClick={disconnect} disabled={busy} className="gh-btn gh-btn-danger !h-10">{busy ? t('common.saving') : t('achievements.disconnect')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

/* ───────── Recent / rarest strips ───────── */

function UnlockStrip({ title, items }) {
    const { t, locale } = useT();
    return (
        <section>
            <h2 className="gh-section-title mb-3">{title}</h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(item => {
                    const { icon: PlatformIcon, color } = PLATFORM_META[item.platform] || PLATFORM_META.steam;
                    return (
                        <li key={`${item.gameKey}:${item.id}`} className="gh-surface p-3 flex gap-3 min-w-0">
                            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white/[0.05]">
                                {item.icon && <img src={item.icon} alt="" loading="lazy" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                                <p className="text-xs text-[#8a8f9c] truncate flex items-center gap-1.5">
                                    <PlatformIcon className="shrink-0" style={{ color }} aria-hidden="true" />
                                    <span className="truncate">{item.game}</span>
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <RarityChip rarity={item.rarity} />
                                    {item.at && <span className="text-[11px] text-[#6b7080]">{new Date(item.at).toLocaleDateString(locale)}</span>}
                                    {item.type && <span className="text-[11px] font-semibold" style={{ color: PSN_TROPHY_COLORS[item.type] }}>{t(`achievements.trophy.${item.type}`)}</span>}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/* ───────── Games ───────── */

const GAME_SORTS = {
    recent: (a, b) => (b.lastUnlockAt || b.lastPlayed || '').localeCompare(a.lastUnlockAt || a.lastPlayed || ''),
    progress: (a, b) => b.unlocked / b.total - a.unlocked / a.total || b.unlocked - a.unlocked,
    unlocked: (a, b) => b.unlocked - a.unlocked,
    name: (a, b) => a.name.localeCompare(b.name),
};

function GamesSection({ uid, games, loading }) {
    const { t } = useT();
    const [platform, setPlatform] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('recent');
    const [onlyStarted, setOnlyStarted] = useState(false);
    const [visible, setVisible] = useState(GAMES_PAGE);
    const [open, setOpen] = useState(null);

    const counts = useMemo(() => {
        const out = { all: games.length };
        for (const g of games) out[g.platform] = (out[g.platform] || 0) + 1;
        return out;
    }, [games]);

    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();
        return games
            .filter(g => platform === 'all' || g.platform === platform)
            .filter(g => !onlyStarted || g.unlocked > 0)
            .filter(g => !q || g.name.toLowerCase().includes(q))
            .sort(GAME_SORTS[sort]);
    }, [games, platform, search, sort, onlyStarted]);

    if (loading) return <Spinner />;
    if (!games.length) {
        return (
            <EmptyState icon={BsTrophy} title={t('achievements.emptyTitle')} text={t('achievements.emptyText')} />
        );
    }

    const tabs = [
        { id: 'all', label: t('library.tabs.all'), count: counts.all },
        ...SYNC_PLATFORMS.filter(p => counts[p]).map(p => ({ id: p, label: t(`profileExtras.platforms.${p}`), count: counts[p] })),
    ];

    return (
        <section>
            <h2 className="gh-section-title mb-3">{t('achievements.gamesTitle')}</h2>
            <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-3">
                <Tabs tabs={tabs} value={platform} onChange={id => { setPlatform(id); setVisible(GAMES_PAGE); }} className="lg:flex-1" />
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative sm:w-56">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7080]" aria-hidden="true" />
                        <input value={search} onChange={e => { setSearch(e.target.value.slice(0, 80)); setVisible(GAMES_PAGE); }} placeholder={t('achievements.searchGames')} className={`${inputClass} pl-8`} />
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('achievements.sortLabel')} className={`${inputClass} sm:w-44`}>
                        {Object.keys(GAME_SORTS).map(key => <option key={key} value={key}>{t(`achievements.gameSort.${key}`)}</option>)}
                    </select>
                </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#a1a6b3] mb-3 cursor-pointer">
                <input type="checkbox" checked={onlyStarted} onChange={e => { setOnlyStarted(e.target.checked); setVisible(GAMES_PAGE); }} className="accent-[#8b5cf6]" />
                {t('achievements.onlyStarted')}
            </label>

            {shown.length === 0 ? (
                <p className="gh-surface p-4 text-sm text-[#8a8f9c]">{t('achievements.noGamesMatch')}</p>
            ) : (
                <ul className="space-y-2">
                    {shown.slice(0, visible).map(game => (
                        <GameRow key={game.gameKey} uid={uid} game={game} open={open === game.gameKey} onToggle={() => setOpen(open === game.gameKey ? null : game.gameKey)} />
                    ))}
                </ul>
            )}
            {shown.length > visible && (
                <button type="button" onClick={() => setVisible(v => v + GAMES_PAGE)} className="gh-btn gh-btn-secondary w-full mt-3">
                    {t('achievements.showMoreGames', { count: shown.length - visible })}
                </button>
            )}
        </section>
    );
}

function GameRow({ uid, game, open, onToggle }) {
    const { t, locale } = useT();
    const nf = new Intl.NumberFormat(locale);
    const { icon: PlatformIcon, color } = PLATFORM_META[game.platform] || PLATFORM_META.steam;
    const percent = game.total ? Math.round((game.unlocked / game.total) * 100) : 0;
    const href = game.platform === 'steam' ? gameHref(game.gameKey) : null;
    const [items, setItems] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!open || items) return undefined;
        let active = true;
        getAchievementItems(uid, game.gameKey)
            .then(list => active && setItems(list))
            .catch(err => {
                console.error('Could not load achievements:', err);
                if (active) setError(true);
            });
        return () => { active = false; };
    }, [open, items, uid, game.gameKey]);

    // A new sync changed the counts: reload the list next time it is opened
    useEffect(() => { setItems(null); }, [game.fingerprint]);

    const points = game.platform === 'xbox' && game.pointsTotal
        ? `${nf.format(game.points || 0)} / ${nf.format(game.pointsTotal)}G`
        : null;

    return (
        <li className="gh-surface overflow-hidden">
            <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02]">
                <div className={`shrink-0 overflow-hidden rounded-md bg-white/[0.05] ${game.platform === 'steam' ? 'h-[43px] w-[92px]' : 'h-12 w-12'}`}>
                    {game.image && <img src={game.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-white min-w-0">
                        <PlatformIcon className="shrink-0" style={{ color }} aria-hidden="true" />
                        <span className="truncate">{game.name}</span>
                        {game.perfect && <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#34d399] border border-[#34d399]/40 rounded px-1">{t('achievements.perfectBadge')}</span>}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 max-w-xs rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: game.perfect ? '#34d399' : '#8b5cf6' }} />
                        </div>
                        <span className="text-[11px] text-[#a1a6b3] shrink-0">
                            {nf.format(game.unlocked)}/{nf.format(game.total)} · {percent}%
                        </span>
                    </div>
                    <p className="text-[11px] text-[#6b7080] mt-0.5 truncate">
                        {[
                            points,
                            game.trophies?.platinum ? t('achievements.platinumEarned') : null,
                            game.playtimeHours ? t('library.hoursShort', { hours: nf.format(game.playtimeHours) }) : null,
                        ].filter(Boolean).join(' · ')}
                    </p>
                </div>
                <BsChevronDown className={`h-4 w-4 shrink-0 text-[#6b7080] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open && (
                <div className="border-t border-white/[0.06] px-3 pb-3 pt-2">
                    {href && <Link to={href} className="inline-block mb-2 text-xs font-semibold text-[#c4b5fd] hover:text-white">{t('achievements.openGamePage')}</Link>}
                    {error ? (
                        <p className="text-sm text-red-400">{t('achievements.loadError')}</p>
                    ) : !items ? (
                        <Spinner className="py-6" />
                    ) : items.length === 0 ? (
                        <p className="text-sm text-[#8a8f9c] py-2">{t('achievements.countsOnly')}</p>
                    ) : (
                        <AchievementList items={items} />
                    )}
                </div>
            )}
        </li>
    );
}

/* ───────── Badges ───────── */

function BadgesSection({ gamer }) {
    const { t, locale } = useT();
    const nf = new Intl.NumberFormat(locale);
    const badges = evaluateGamerBadges(gamer).sort((a, b) => b.unlocked - a.unlocked);
    const unlocked = badges.filter(b => b.unlocked).length;
    return (
        <section>
            <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="gh-section-title">{t('achievements.badgesTitle')}</h2>
                <span className="text-xs text-[#8a8f9c]">{t('profile.unlockedOf', { unlocked, total: badges.length })}</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map(badge => {
                    const Icon = badge.icon;
                    return (
                        <li key={badge.id} className={`gh-surface p-3 ${badge.unlocked ? '' : 'opacity-80'}`}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                                    style={badge.unlocked ? { background: `${badge.color}22`, color: badge.color, boxShadow: `0 0 20px ${badge.color}33` } : { background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}
                                >
                                    {badge.unlocked ? <Icon className="w-4 h-4" aria-hidden="true" /> : <FaLock className="w-3.5 h-3.5" aria-hidden="true" />}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate ${badge.unlocked ? 'text-white' : 'text-[#8a8f9c]'}`}>{t(`profile.badgeList.${badge.id}.name`)}</p>
                                    <p className="text-xs text-[#6b7080] truncate">{t(`profile.badgeList.${badge.id}.desc`)}</p>
                                </div>
                            </div>
                            {!badge.unlocked && (
                                <div className="mt-2">
                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(badge.current / badge.target) * 100}%`, background: badge.color }} />
                                    </div>
                                    <p className="text-[10px] text-[#6b7080] mt-1 text-right">{nf.format(badge.current)} / {nf.format(badge.target)}</p>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
