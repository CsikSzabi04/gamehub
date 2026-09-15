/* eslint-disable react/prop-types */
// /library: backlog tracker with Steam import, stats, "what to play next" and yearly Wrapped.
import { useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsArrowRepeat, BsCollection, BsController, BsPencil, BsSearch, BsStar, BsStarFill, BsSteam, BsTrash,
} from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { EmptyState, Field, Modal, PageShell, RequireLogin, Spinner, Tabs, inputClass } from '../community/ui.jsx';
import { gameHref } from '../lib/games.js';
import { toDate } from '../lib/firebase.js';
import { useLibrary } from '../library/useLibrary.js';
import {
    LIBRARY_STATUSES, NOTE_MAX, STATUS_COLORS, computeOverview, computeWrapped, itemHours, pickNextGame,
} from '../library/libraryApi.js';
import SteamImport from '../library/SteamImport.jsx';
import WrappedCard from '../library/WrappedCard.jsx';

const PAGE = 48;

function seededRandom(seed) {
    let state = (seed * 2654435761) >>> 0 || 1;
    return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return ((state >>> 0) % 100000) / 100000;
    };
}

function Stars({ value, onChange, size = 'w-4 h-4', label }) {
    const { t } = useT();
    return (
        <div className="flex items-center" role="group" aria-label={label || t('library.card.rating')}>
            {[1, 2, 3, 4, 5].map(n => {
                const on = value != null && n <= value;
                const Icon = on ? BsStarFill : BsStar;
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(value === n ? null : n)}
                        aria-label={t('library.card.rate', { count: n })}
                        aria-pressed={on}
                        className="p-1 -m-px text-[#fbbf24] hover:scale-110 transition-transform"
                    >
                        <Icon className={`${size} ${on ? '' : 'text-[#4b5060]'}`} aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}

function StatusSelect({ value, onChange, className = '' }) {
    const { t } = useT();
    return (
        <div className={`relative ${className}`}>
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[value] }} aria-hidden="true" />
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label={t('library.card.status')}
                className="w-full h-9 rounded-lg bg-[#0a0b0f] border border-white/[0.1] pl-6 pr-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
            >
                {LIBRARY_STATUSES.map(status => (
                    <option key={status} value={status}>{t(`library.status.${status}`)}</option>
                ))}
            </select>
        </div>
    );
}

function LibraryCard({ item, onStatus, onRate, onEdit }) {
    const { t, locale } = useT();
    const hours = itemHours(item);
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const href = gameHref(item.gameKey);

    return (
        <article className="gh-surface overflow-hidden flex flex-col min-w-0">
            <Link to={href} className="block aspect-[460/215] bg-white/[0.04] overflow-hidden">
                {item.image && (
                    <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                )}
            </Link>
            <div className="p-3 flex flex-col gap-2.5 flex-1">
                <div className="flex items-start gap-2">
                    <Link to={href} className="flex-1 min-w-0 font-semibold text-white leading-snug line-clamp-2 hover:text-[#c4b5fd]">{item.name}</Link>
                    <button type="button" onClick={() => onEdit(item)} aria-label={t('library.card.edit')} className="shrink-0 -mr-1 -mt-0.5 p-2 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]">
                        <BsPencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                </div>
                <StatusSelect value={item.status} onChange={status => onStatus(item, status)} />
                <div className="flex items-center justify-between gap-2">
                    <Stars value={item.rating} onChange={rating => onRate(item, rating)} />
                    <span className="text-xs text-[#a1a6b3] tabular-nums whitespace-nowrap">
                        {hours > 0 ? t('library.hoursShort', { hours: nf.format(hours) }) : t('library.card.noHours')}
                    </span>
                </div>
                {item.note && (
                    <button type="button" onClick={() => onEdit(item)} className="text-left text-xs text-[#c9ccd4] bg-white/[0.04] rounded-lg px-2.5 py-2 line-clamp-2 break-words">
                        {item.note}
                    </button>
                )}
            </div>
        </article>
    );
}

function EditModal({ item, onClose, onSave, onRemove }) {
    const { t, locale } = useT();
    const [note, setNote] = useState(item?.note || '');
    const [hours, setHours] = useState(item?.playtimeHours ?? '');
    const [platform, setPlatform] = useState(item?.platform || '');
    const [rating, setRating] = useState(item?.rating ?? null);
    const [saving, setSaving] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [error, setError] = useState(false);

    const run = async action => {
        setSaving(true);
        setError(false);
        try {
            await action();
            onClose();
        } catch (err) {
            console.error('Library edit failed:', err);
            setError(true);
            setSaving(false);
        }
    };

    const steamHours = item?.steamPlaytimeHours;
    return (
        <Modal open={Boolean(item)} onClose={onClose} title={item?.name || ''} subtitle={t('library.edit.subtitle')}>
            {item && (
                <form
                    className="space-y-4"
                    onSubmit={e => {
                        e.preventDefault();
                        run(() => onSave(item, { note, playtimeHours: hours, platform, rating }));
                    }}
                >
                    <Field label={t('library.card.rating')}>
                        <Stars value={rating} onChange={setRating} size="w-6 h-6" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label={t('library.edit.hours')}
                            hint={steamHours ? t('library.edit.steamHours', { hours: new Intl.NumberFormat(locale).format(steamHours) }) : null}
                        >
                            <input type="number" min="0" max="100000" step="0.5" inputMode="decimal" value={hours} onChange={e => setHours(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label={t('library.edit.platform')}>
                            <input value={platform} maxLength={40} onChange={e => setPlatform(e.target.value)} placeholder={t('library.edit.platformPlaceholder')} className={inputClass} />
                        </Field>
                    </div>
                    <Field label={t('library.edit.note')} hint={`${note.length}/${NOTE_MAX}`}>
                        <textarea
                            value={note}
                            maxLength={NOTE_MAX}
                            rows={4}
                            onChange={e => setNote(e.target.value.slice(0, NOTE_MAX))}
                            placeholder={t('library.edit.notePlaceholder')}
                            className={`${inputClass} !h-auto py-2 resize-none`}
                        />
                    </Field>
                    {item.completedAt && item.status === 'completed' && (
                        <p className="text-xs text-[#6b7080]">{t('library.edit.completedOn', { date: toDate(item.completedAt)?.toLocaleDateString(locale) })}</p>
                    )}
                    {error && <p className="text-sm text-[#f87171]">{t('library.errors.save')}</p>}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-1">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => (confirmRemove ? run(() => onRemove(item)) : setConfirmRemove(true))}
                            className="gh-btn gh-btn-danger"
                        >
                            <BsTrash aria-hidden="true" />
                            {confirmRemove ? t('library.edit.confirmRemove') : t('library.menu.remove')}
                        </button>
                        <button type="submit" disabled={saving} className="gh-btn gh-btn-primary">{t('library.edit.save')}</button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

function StatTile({ value, label, accent }) {
    return (
        <div className="gh-surface px-4 py-3 min-w-0">
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums truncate" style={{ color: accent || '#ffffff' }}>{value}</p>
            <p className="text-xs text-[#a1a6b3] mt-0.5 leading-tight">{label}</p>
        </div>
    );
}

function NextPick({ items, onStatus }) {
    const { t, locale } = useT();
    const [roll, setRoll] = useState(() => ({ seed: Math.floor(Math.random() * 1e6), exclude: null }));
    const pick = useMemo(() => pickNextGame(items, roll.exclude, seededRandom(roll.seed)), [items, roll]);
    if (!pick) return null;
    const hours = itemHours(pick);
    const backlogCount = items.filter(item => item.status === 'backlog').length;

    return (
        <div className="gh-surface p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link to={gameHref(pick.gameKey)} className="flex items-center gap-3 min-w-0 flex-1">
                {pick.image && <img src={pick.image} alt="" className="h-14 w-[120px] shrink-0 rounded-lg object-cover bg-white/[0.04]" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />}
                <span className="min-w-0">
                    <span className="block gh-eyebrow !text-[#c4b5fd]">{t('library.next.title')}</span>
                    <span className="block font-semibold text-white truncate">{pick.name}</span>
                    <span className="block text-xs text-[#a1a6b3]">
                        {hours > 0 ? t('library.next.started', { hours: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(hours) }) : t('library.next.fresh')}
                    </span>
                </span>
            </Link>
            <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => onStatus(pick, 'playing')} className="gh-btn gh-btn-primary flex-1 sm:flex-none">
                    <BsController aria-hidden="true" />
                    {t('library.next.start')}
                </button>
                {backlogCount > 1 && (
                    <button type="button" onClick={() => setRoll(r => ({ seed: r.seed + 1, exclude: pick.gameKey }))} aria-label={t('library.next.another')} title={t('library.next.another')} className="gh-btn gh-btn-secondary !px-3">
                        <BsArrowRepeat aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}

function sortTime(item) {
    return toDate(item.updatedAt)?.getTime() || toDate(item.createdAt)?.getTime() || 0;
}

function LibraryContent() {
    const { t, locale } = useT();
    const { profile } = useContext(UserContext) || {};
    const { items, loading, byKey, setStatus, update, remove, importItems } = useLibrary();
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('updated');
    const [visible, setVisible] = useState(PAGE);
    const [editing, setEditing] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [error, setError] = useState(false);

    const year = new Date().getFullYear();
    const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const overview = useMemo(() => computeOverview(items, year), [items, year]);
    const wrapped = useMemo(() => computeWrapped(items, year), [items, year]);

    const counts = useMemo(() => {
        const out = Object.fromEntries(LIBRARY_STATUSES.map(status => [status, 0]));
        for (const item of items) if (out[item.status] != null) out[item.status] += 1;
        return out;
    }, [items]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const filtered = items.filter(item => (tab === 'all' || item.status === tab) && (!q || String(item.name || '').toLowerCase().includes(q)));
        const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
        if (sort === 'name') filtered.sort((a, b) => collator.compare(a.name || '', b.name || ''));
        else if (sort === 'playtime') filtered.sort((a, b) => itemHours(b) - itemHours(a));
        else filtered.sort((a, b) => sortTime(b) - sortTime(a));
        return filtered;
    }, [items, tab, search, sort, locale]);

    const guard = useCallback(async action => {
        setError(false);
        try {
            await action();
        } catch (err) {
            console.error('Library update failed:', err);
            setError(true);
        }
    }, []);

    const onStatus = useCallback((item, status) => guard(() => setStatus(item, status)), [guard, setStatus]);
    const onRate = useCallback((item, rating) => guard(() => update(item.gameKey, { rating })), [guard, update]);
    const onSave = useCallback((item, patch) => update(item.gameKey, patch), [update]);
    const onRemove = useCallback(item => remove(item.gameKey), [remove]);
    const closeEdit = useCallback(() => setEditing(null), []);
    const closeImport = useCallback(() => setImportOpen(false), []);

    const tabs = [
        { id: 'all', label: t('library.tabs.all'), count: items.length },
        ...LIBRARY_STATUSES.map(status => ({ id: status, label: t(`library.status.${status}`), count: counts[status] })),
    ];

    const changeTab = id => {
        setTab(id);
        setVisible(PAGE);
    };

    const importButton = (
        <button type="button" onClick={() => setImportOpen(true)} className="gh-btn gh-btn-primary">
            <BsSteam aria-hidden="true" />
            {t('library.import.open')}
        </button>
    );

    let body;
    if (loading) {
        body = <Spinner />;
    } else if (!items.length) {
        body = (
            <EmptyState
                icon={BsCollection}
                title={t('library.empty.title')}
                text={t('library.empty.text')}
                action={(
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                        {importButton}
                        <Link to="/hub" className="gh-btn gh-btn-secondary">{t('library.empty.browse')}</Link>
                    </div>
                )}
            />
        );
    } else {
        body = (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <StatTile value={nf.format(overview.total)} label={t('library.stats.total')} />
                    <StatTile value={nf.format(overview.completedThisYear)} label={t('library.stats.completedYear', { year })} accent={STATUS_COLORS.completed} />
                    <StatTile value={nf.format(overview.backlog)} label={t('library.stats.backlog')} accent={STATUS_COLORS.backlog} />
                    <StatTile value={nf.format(overview.hours)} label={t('library.stats.hours')} />
                    <div className="col-span-2 sm:col-span-1">
                        <StatTile value={`${overview.shamePct}%`} label={t('library.stats.shame')} accent={overview.shamePct >= 50 ? STATUS_COLORS.dropped : '#ffffff'} />
                    </div>
                </div>

                <div className="mt-3">
                    <NextPick items={items} onStatus={onStatus} />
                </div>

                <div className="mt-8 space-y-3">
                    <Tabs tabs={tabs} value={tab} onChange={changeTab} />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <label className="relative flex-1">
                            <span className="sr-only">{t('library.searchPlaceholder')}</span>
                            <BsSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080]" aria-hidden="true" />
                            <input
                                type="search"
                                value={search}
                                onChange={e => { setSearch(e.target.value.slice(0, 80)); setVisible(PAGE); }}
                                placeholder={t('library.searchPlaceholder')}
                                className={`${inputClass} pl-9`}
                            />
                        </label>
                        <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('library.sort.label')} className={`${inputClass} sm:w-56`}>
                            <option value="updated">{t('library.sort.updated')}</option>
                            <option value="name">{t('library.sort.name')}</option>
                            <option value="playtime">{t('library.sort.playtime')}</option>
                        </select>
                    </div>
                </div>

                {error && <p className="mt-3 text-sm text-[#f87171]">{t('library.errors.save')}</p>}

                <div className="mt-4">
                    {list.length ? (
                        <>
                            <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {list.slice(0, visible).map(item => (
                                    <LibraryCard key={item.gameKey} item={item} onStatus={onStatus} onRate={onRate} onEdit={setEditing} />
                                ))}
                            </div>
                            {list.length > visible && (
                                <button type="button" onClick={() => setVisible(v => v + PAGE)} className="gh-btn gh-btn-secondary w-full mt-4">
                                    {t('library.showMore', { count: list.length - visible })}
                                </button>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={BsSearch}
                            title={t('library.empty.filteredTitle')}
                            text={search ? t('library.empty.filteredSearch') : t('library.empty.filteredTab')}
                        />
                    )}
                </div>

                <WrappedCard wrapped={wrapped} username={profile?.username} />
            </>
        );
    }

    return (
        <>
            {items.length > 0 && <div className="-mt-4 mb-6 flex flex-col sm:flex-row sm:justify-end">{importButton}</div>}
            {body}
            {editing && (
                <EditModal
                    key={editing.gameKey}
                    item={byKey[editing.gameKey] || editing}
                    onClose={closeEdit}
                    onSave={onSave}
                    onRemove={onRemove}
                />
            )}
            <SteamImport open={importOpen} onClose={closeImport} byKey={byKey} importItems={importItems} />
        </>
    );
}

export default function LibraryPage() {
    const { t } = useT();
    return (
        <PageShell eyebrow={t('library.eyebrow')} title={t('library.title')} subtitle={t('library.subtitle')}>
            <RequireLogin message={t('library.loginText')}>
                <LibraryContent />
            </RequireLogin>
        </PageShell>
    );
}
