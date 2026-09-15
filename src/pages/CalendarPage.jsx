/* eslint-disable react/prop-types */
import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    BsAndroid2, BsApple, BsBell, BsBoxArrowUpRight, BsCalendar3, BsCalendarPlus, BsChevronLeft, BsChevronRight,
    BsGlobe, BsGrid3X3Gap, BsListUl, BsNintendoSwitch, BsPlaystation, BsTrash3, BsUbuntu, BsWindows, BsXbox,
} from 'react-icons/bs';
import { EmptyState, Modal, PageShell, RequireLogin, Spinner, Tabs } from '../community/ui.jsx';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import ReminderToggle from '../releases/ReminderToggle.jsx';
import PrefSwitch from '../releases/PrefSwitch.jsx';
import { useReminders } from '../releases/useReminders.js';
import { downloadIcs } from '../releases/ics.js';
import { dateFromKey, dayKey, daysUntil, isMonthKey, monthKeyOf, shiftMonth } from '../releases/dates.js';

const PLATFORMS = ['all', 'pc', 'playstation', 'xbox', 'switch'];
const PLATFORM_ICONS = { pc: BsWindows, playstation: BsPlaystation, xbox: BsXbox, switch: BsNintendoSwitch, mac: BsApple, ios: BsApple, linux: BsUbuntu, android: BsAndroid2, web: BsGlobe };

function toReleases(raw) {
    return { items: Array.isArray(raw?.items) ? raw.items.filter(i => i && i.id && i.released) : [] };
}

const reminderEntry = game => ({
    gameKey: game.gameKey || `rawg-${game.id}`,
    name: game.name,
    image: game.image,
    releaseDate: game.tba ? null : game.released,
    url: `/searchreview/${game.id}`,
    platforms: game.platforms || [],
});

function isDesktop() {
    try {
        return window.matchMedia('(min-width: 768px)').matches;
    } catch {
        return true;
    }
}

function PlatformIcons({ platforms = [], className = '' }) {
    const { t } = useT();
    return (
        <span className={`inline-flex items-center gap-1.5 text-[#8a8f9c] ${className}`}>
            {platforms.filter(p => PLATFORM_ICONS[p]).slice(0, 5).map(p => {
                const Icon = PLATFORM_ICONS[p];
                return <Icon key={p} className="w-3.5 h-3.5" title={t(`calendar.platforms.${p}`)} aria-label={t(`calendar.platforms.${p}`)} />;
            })}
        </span>
    );
}

function Thumb({ src, className = '' }) {
    return src
        ? <img src={src} alt="" loading="lazy" decoding="async" className={`object-cover bg-[#171a22] ${className}`} />
        : <span className={`block bg-gradient-to-br from-[#1d2030] to-[#12141b] ${className}`} />;
}

/** "in 3 days" / "today" / "released" / "TBA" */
function useRelativeDay() {
    const { t } = useT();
    return useCallback((key, fallback) => {
        const days = daysUntil(key);
        if (days == null) return fallback || t('calendar.tba');
        if (days === 0) return t('calendar.today');
        if (days < 0) return t('calendar.released');
        return t('calendar.inDays', { count: days });
    }, [t]);
}

// ━━━━━━━━━━━━━━━━ Calendar views ━━━━━━━━━━━━━━━━

function MonthGrid({ month, byDay, onSelect, onDay }) {
    const { t, lang, locale } = useT();
    const weekStart = lang === 'en' ? 0 : 1;
    const [year, mon] = month.split('-').map(Number);
    const offset = (new Date(year, mon - 1, 1).getDay() - weekStart + 7) % 7;
    const daysInMonth = new Date(year, mon, 0).getDate();
    const today = dayKey();
    const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
    while (cells.length % 7) cells.push(null);
    // 7 Jan 2024 was a Sunday
    const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + weekStart + i).toLocaleDateString(locale, { weekday: 'short' }));

    return (
        <div className="gh-surface overflow-hidden">
            <div className="grid grid-cols-7 border-b border-white/[0.06]">
                {weekdays.map(day => (
                    <div key={day} className="px-1 sm:px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#6b7080]">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {cells.map((key, index) => {
                    if (!key) return <div key={`blank-${index}`} className="min-h-[64px] md:min-h-[128px] border-b border-r border-white/[0.04] bg-black/10" />;
                    const games = byDay.get(key) || [];
                    const isToday = key === today;
                    const extra = games.length - 3;
                    return (
                        <div
                            key={key}
                            className={`relative min-h-[64px] md:min-h-[128px] border-b border-r border-white/[0.04] p-1 md:p-1.5 ${isToday ? 'bg-[#8b5cf6]/[0.08] ring-1 ring-inset ring-[#8b5cf6]/50' : ''}`}
                        >
                            <button
                                type="button"
                                onClick={() => games.length && onDay(key)}
                                disabled={!games.length}
                                className="w-full flex items-center justify-between gap-1 text-left disabled:cursor-default"
                                aria-label={dateFromKey(key).toLocaleDateString(locale, { month: 'long', day: 'numeric' })}
                            >
                                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-semibold ${isToday ? 'bg-[#8b5cf6] text-white' : 'text-[#a1a6b3]'}`}>
                                    {Number(key.slice(8))}
                                </span>
                                {games.length > 0 && (
                                    <span className="md:hidden inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8b5cf6]/25 px-1 text-[10px] font-bold text-[#c4b5fd]">{games.length}</span>
                                )}
                            </button>
                            {games[0]?.image && (
                                <button type="button" onClick={() => onDay(key)} className="md:hidden mt-1 block w-full" aria-hidden="true" tabIndex={-1}>
                                    <Thumb src={games[0].image} className="w-full h-7 rounded" />
                                </button>
                            )}
                            <div className="hidden md:flex flex-col gap-1 mt-1">
                                {games.slice(0, 3).map(game => (
                                    <button
                                        key={game.id}
                                        type="button"
                                        onClick={() => onSelect(game)}
                                        className="group flex items-center gap-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] p-1 text-left transition-colors"
                                        title={game.name}
                                    >
                                        <Thumb src={game.image} className="w-8 h-5 rounded-sm shrink-0" />
                                        <span className="truncate text-[11px] leading-tight text-[#c9ccd4] group-hover:text-white">{game.name}</span>
                                    </button>
                                ))}
                                {extra > 0 && (
                                    <button type="button" onClick={() => onDay(key)} className="text-[11px] font-medium text-[#c4b5fd] hover:text-white text-left px-1">
                                        {t('calendar.more', { count: extra })}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function GameRow({ game, onSelect }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
            <button type="button" onClick={() => onSelect(game)} className="flex flex-1 min-w-0 items-center gap-3 text-left">
                <Thumb src={game.image} className="w-20 h-12 sm:w-24 sm:h-14 rounded-lg shrink-0" />
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{game.name}</span>
                    <span className="mt-1 flex items-center gap-2 min-w-0">
                        <PlatformIcons platforms={game.platforms} />
                        {game.genres?.length > 0 && <span className="truncate text-xs text-[#6b7080]">{game.genres.slice(0, 2).join(' · ')}</span>}
                    </span>
                </span>
            </button>
            <ReminderToggle entry={reminderEntry(game)} variant="icon" />
        </div>
    );
}

function AgendaList({ byDay, onSelect }) {
    const { t, locale } = useT();
    const today = dayKey();
    const days = [...byDay.keys()].sort();
    return (
        <div className="space-y-4">
            {days.map(key => {
                const isToday = key === today;
                return (
                    <section key={key} className={`gh-surface p-2 sm:p-3 ${isToday ? '!border-[#8b5cf6]/50' : ''}`}>
                        <h3 className="flex items-center gap-2 px-2 pt-1 pb-2 text-sm font-semibold text-[#eceef2]">
                            <span className="capitalize">{dateFromKey(key).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            {isToday && <span className="rounded-md bg-[#8b5cf6] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">{t('calendar.today')}</span>}
                            <span className="ml-auto text-xs font-normal text-[#6b7080]">{t('calendar.gamesCount', { count: byDay.get(key).length })}</span>
                        </h3>
                        <div className="divide-y divide-white/[0.04]">
                            {byDay.get(key).map(game => <GameRow key={game.id} game={game} onSelect={onSelect} />)}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function GameDetail({ game, onClose }) {
    const { t, locale } = useT();
    const relative = useRelativeDay();
    const date = game ? dateFromKey(game.released) : null;
    return (
        <Modal open={Boolean(game)} onClose={onClose} title={game?.name || ''} subtitle={date ? date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}>
            {game && (
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl aspect-video bg-[#171a22]">
                        <Thumb src={game.image} className="absolute inset-0 w-full h-full" />
                        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                            {game.tba ? t('calendar.tba') : relative(game.released)}
                        </span>
                    </div>
                    {game.platforms?.length > 0 && (
                        <div>
                            <p className="gh-eyebrow mb-1.5">{t('calendar.platformsLabel')}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {game.platforms.map(p => {
                                    const Icon = PLATFORM_ICONS[p];
                                    return <span key={p} className="gh-chip">{Icon && <Icon className="w-3 h-3" />}{t(`calendar.platforms.${p}`)}</span>;
                                })}
                            </div>
                        </div>
                    )}
                    {game.genres?.length > 0 && (
                        <div>
                            <p className="gh-eyebrow mb-1.5">{t('calendar.genresLabel')}</p>
                            <div className="flex flex-wrap gap-1.5">{game.genres.map(g => <span key={g} className="gh-chip">{g}</span>)}</div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
                        <ReminderToggle entry={reminderEntry(game)} withPrompt className="w-full sm:w-auto" />
                        {!game.tba && (
                            <button type="button" onClick={() => downloadIcs(game.name, [reminderEntry(game)])} className="gh-btn gh-btn-secondary w-full sm:w-auto">
                                <BsCalendarPlus /> {t('calendar.addToCalendar')}
                            </button>
                        )}
                        <Link to={`/searchreview/${game.id}`} className="gh-btn gh-btn-light w-full sm:w-auto">
                            {t('calendar.viewGame')} <BsBoxArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </Modal>
    );
}

function DayModal({ day, games, onClose, onSelect }) {
    const { t, locale } = useT();
    return (
        <Modal
            open={Boolean(day)}
            onClose={onClose}
            title={day ? dateFromKey(day).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
            subtitle={t('calendar.gamesCount', { count: games.length })}
        >
            <div className="divide-y divide-white/[0.04] -mx-2">
                {games.map(game => <GameRow key={game.id} game={game} onSelect={onSelect} />)}
            </div>
        </Modal>
    );
}

// ━━━━━━━━━━━━━━━━ My reminders ━━━━━━━━━━━━━━━━

function MyReminders({ onBrowse }) {
    const { t, locale } = useT();
    const { reminders, loading, remove } = useReminders();
    const relative = useRelativeDay();
    const [error, setError] = useState('');
    const exportable = reminders.filter(r => r.releaseDate);

    async function onRemove(key) {
        setError('');
        try {
            await remove(key);
        } catch (err) {
            console.error('remove reminder:', err);
            setError(t('calendar.reminder.error'));
        }
    }

    return (
        <div className="space-y-4">
            <div className="gh-surface p-4 sm:p-5 space-y-4">
                <PrefSwitch type="releases" label={t('calendar.notifyLabel')} hint={t('calendar.notifyHint')} />
                <EnablePushPrompt compact />
            </div>

            {loading ? <Spinner /> : reminders.length === 0 ? (
                <EmptyState
                    icon={BsBell}
                    title={t('calendar.emptyReminders')}
                    text={t('calendar.emptyRemindersText')}
                    action={<button type="button" onClick={onBrowse} className="gh-btn gh-btn-primary">{t('calendar.browse')}</button>}
                />
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-[#a1a6b3]">{t('calendar.remindersCount', { count: reminders.length })}</p>
                        <button
                            type="button"
                            disabled={!exportable.length}
                            onClick={() => downloadIcs('gamedatahub-releases', exportable)}
                            className="gh-btn gh-btn-secondary"
                        >
                            <BsCalendarPlus /> {t('calendar.exportAll')}
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <ul className="gh-surface divide-y divide-white/[0.05]">
                        {reminders.map(r => {
                            const days = daysUntil(r.releaseDate);
                            const date = dateFromKey(r.releaseDate);
                            return (
                                <li key={r.gameKey} className="flex items-center gap-3 p-3">
                                    <Link to={r.url || '/calendar'} className="flex flex-1 min-w-0 items-center gap-3">
                                        <Thumb src={r.image} className="w-20 h-12 sm:w-24 sm:h-14 rounded-lg shrink-0" />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-white">{r.name}</span>
                                            <span className="block text-xs text-[#a1a6b3] mt-0.5">
                                                {date ? date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : (r.releaseText || t('calendar.tba'))}
                                                {date && <span className="sm:hidden"> · {relative(r.releaseDate)}</span>}
                                            </span>
                                        </span>
                                    </Link>
                                    <span className={`hidden sm:inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${days != null && days >= 0 && days <= 7 ? 'bg-[#8b5cf6]/15 text-[#c4b5fd]' : 'bg-white/[0.05] text-[#a1a6b3]'}`}>
                                        {relative(r.releaseDate)}
                                    </span>
                                    {r.releaseDate && (
                                        <button type="button" onClick={() => downloadIcs(r.name, [r])} className="gh-icon-btn shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]" aria-label={t('calendar.addToCalendar')} title={t('calendar.addToCalendar')}>
                                            <BsCalendarPlus className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button type="button" onClick={() => onRemove(r.gameKey)} className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a1a6b3] hover:text-red-400 hover:bg-red-500/10" aria-label={t('calendar.remove')} title={t('calendar.remove')}>
                                        <BsTrash3 className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━ Page ━━━━━━━━━━━━━━━━

export default function CalendarPage() {
    const { t, locale } = useT();
    const [params, setParams] = useSearchParams();
    const currentMonth = monthKeyOf();
    const month = isMonthKey(params.get('month')) ? params.get('month') : currentMonth;
    const platform = PLATFORMS.includes(params.get('platform')) ? params.get('platform') : 'all';
    const tab = params.get('tab') === 'reminders' ? 'reminders' : 'calendar';
    const [view, setView] = useState(() => (isDesktop() ? 'grid' : 'list'));
    const [selected, setSelected] = useState(null);
    const [openDay, setOpenDay] = useState(null);
    const { reminders } = useReminders();

    const update = useCallback(changes => {
        setParams(prev => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(changes)) {
                if (value == null || (key === 'platform' && value === 'all') || (key === 'tab' && value === 'calendar')) next.delete(key);
                else next.set(key, value);
            }
            return next;
        }, { replace: true });
    }, [setParams]);

    const url = tab === 'calendar' ? `${API_BASE}/releases?month=${month}&platform=${platform}` : null;
    const { data, loading, error } = useApi(url, toReleases);

    const byDay = useMemo(() => {
        const map = new Map();
        for (const game of data?.items || []) {
            if (!map.has(game.released)) map.set(game.released, []);
            map.get(game.released).push(game);
        }
        return map;
    }, [data]);

    const [year, mon] = month.split('-').map(Number);
    const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const unavailable = error && /404/.test(String(error.message));

    return (
        <PageShell eyebrow={t('calendar.eyebrow')} title={t('calendar.title')} subtitle={t('calendar.subtitle')} wide>
            <Tabs
                className="mb-5"
                value={tab}
                onChange={id => update({ tab: id })}
                tabs={[
                    { id: 'calendar', label: t('calendar.tabCalendar') },
                    { id: 'reminders', label: t('calendar.tabReminders'), count: reminders.length || null },
                ]}
            />

            {tab === 'reminders' ? (
                <RequireLogin message={t('calendar.loginText')}>
                    <MyReminders onBrowse={() => update({ tab: 'calendar' })} />
                </RequireLogin>
            ) : (
                <>
                    <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => update({ month: shiftMonth(month, -1) })} className="gh-btn gh-btn-secondary !px-0 w-10" aria-label={t('calendar.prevMonth')}>
                                <BsChevronLeft />
                            </button>
                            <h2 className="min-w-0 flex-1 lg:flex-none lg:w-52 text-center text-lg font-bold capitalize text-white truncate">{monthLabel}</h2>
                            <button type="button" onClick={() => update({ month: shiftMonth(month, 1) })} className="gh-btn gh-btn-secondary !px-0 w-10" aria-label={t('calendar.nextMonth')}>
                                <BsChevronRight />
                            </button>
                            <button type="button" onClick={() => update({ month: null })} disabled={month === currentMonth} className="gh-btn gh-btn-secondary">
                                {t('calendar.jumpToday')}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 lg:ml-auto min-w-0">
                            <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 min-w-0 flex-1" role="group" aria-label={t('calendar.platformsLabel')}>
                                {PLATFORMS.map(p => {
                                    const Icon = PLATFORM_ICONS[p];
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => update({ platform: p })}
                                            aria-pressed={platform === p}
                                            className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${platform === p ? 'bg-white text-[#0a0b0f]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                                        >
                                            {Icon && <Icon className="w-3.5 h-3.5" />}
                                            {t(`calendar.platforms.${p}`)}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex shrink-0 rounded-lg bg-white/[0.05] p-0.5" role="group" aria-label={t('calendar.viewLabel')}>
                                {[['grid', BsGrid3X3Gap], ['list', BsListUl]].map(([id, Icon]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setView(id)}
                                        aria-pressed={view === id}
                                        aria-label={t(`calendar.view.${id}`)}
                                        title={t(`calendar.view.${id}`)}
                                        className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${view === id ? 'bg-white text-[#0a0b0f]' : 'text-[#a1a6b3] hover:text-white'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {unavailable ? (
                        <EmptyState icon={BsCalendar3} title={t('calendar.unavailable')} text={t('calendar.unavailableText')} />
                    ) : error && !data ? (
                        <EmptyState icon={BsCalendar3} title={t('calendar.error')} text={t('calendar.errorText')} />
                    ) : loading ? (
                        <Spinner />
                    ) : view === 'grid' ? (
                        <>
                            <MonthGrid month={month} byDay={byDay} onSelect={setSelected} onDay={setOpenDay} />
                            {byDay.size === 0 && <p className="mt-4 text-center text-sm text-[#a1a6b3]">{t('calendar.emptyMonth')}</p>}
                        </>
                    ) : byDay.size === 0 ? (
                        <EmptyState icon={BsCalendar3} title={t('calendar.emptyMonth')} text={t('calendar.emptyMonthText')} />
                    ) : (
                        <AgendaList byDay={byDay} onSelect={setSelected} />
                    )}
                    <p className="mt-4 text-xs text-[#6b7080]">{t('calendar.source')}</p>
                </>
            )}

            <DayModal day={openDay} games={openDay ? byDay.get(openDay) || [] : []} onClose={() => setOpenDay(null)} onSelect={game => { setOpenDay(null); setSelected(game); }} />
            <GameDetail game={selected} onClose={() => setSelected(null)} />
        </PageShell>
    );
}
