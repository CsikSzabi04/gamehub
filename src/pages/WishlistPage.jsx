/* eslint-disable react/prop-types */
// /wishlist: the linked Steam wishlist with live prices, per-game price alerts and "watch the whole wishlist".
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsArrowRepeat, BsBellFill, BsBell, BsBoxArrowUpRight, BsCheck2, BsCollection, BsExclamationTriangle, BsHeart, BsSearch, BsSteam,
} from 'react-icons/bs';
import { EmptyState, PageShell, RequireLogin, Spinner, Tabs, inputClass } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { useLibrary } from '../library/useLibrary.js';
import { fetchSteamOwned, saveSteamId } from '../library/libraryApi.js';
import AlertModal from '../prices/AlertModal.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import {
    PRICE_REGIONS, SALE_DISCOUNTS, alertTargetText, formatMoney, regionName, usePriceAlerts, usePriceRegion,
} from '../prices/priceUtils.js';
import { fetchWishlist, saveWishlistAlerts, steamErrorCode } from '../steam/steamApi.js';

const PAGE = 40;

const SORTS = {
    added: (a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''),
    priority: (a, b) => (a.priority ?? 1e9) - (b.priority ?? 1e9),
    discount: (a, b) => (b.price?.discount || 0) - (a.price?.discount || 0),
    priceLow: (a, b) => (a.price?.final ?? (a.isFree ? 0 : 1e9)) - (b.price?.final ?? (b.isFree ? 0 : 1e9)),
    priceHigh: (a, b) => (b.price?.final ?? -1) - (a.price?.final ?? -1),
    name: (a, b) => a.name.localeCompare(b.name),
    release: (a, b) => (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999'),
};

export default function WishlistPage() {
    const { t } = useT();
    return (
        <PageShell eyebrow={t('steam.wishlistEyebrow')} title={t('steam.wishlistTitle')} subtitle={t('steam.wishlistSubtitle')}>
            <RequireLogin>
                <Wishlist />
            </RequireLogin>
        </PageShell>
    );
}

function Wishlist() {
    const { t, locale } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const [region, setRegion] = usePriceRegion();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { alerts } = usePriceAlerts(user);
    const alertsByKey = useMemo(() => Object.fromEntries(alerts.map(a => [a.id, a])), [alerts]);
    const steamId = profile?.steamId;

    const load = refresh => {
        setLoading(true);
        setError(null);
        fetchWishlist(user, region, refresh)
            .then(setData)
            .catch(err => setError(steamErrorCode(err)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user && steamId) load(false);
    }, [user, steamId, region]); // eslint-disable-line react-hooks/exhaustive-deps -- load reads these

    if (!steamId) return <LinkSteam />;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-2">
                <label className="block">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('prices.region')}</span>
                    <select value={region} onChange={e => setRegion(e.target.value)} className={`${inputClass} w-56`}>
                        {PRICE_REGIONS.map(code => <option key={code} value={code}>{regionName(code, locale)}</option>)}
                    </select>
                </label>
                <button type="button" onClick={() => load(true)} disabled={loading} className="gh-btn gh-btn-secondary !h-10">
                    <BsArrowRepeat className={loading ? 'animate-spin' : ''} aria-hidden="true" /> {t('steam.refresh')}
                </button>
                <Link to="/alerts" className="gh-btn gh-btn-secondary !h-10 sm:ml-auto"><BsBell aria-hidden="true" /> {t('steam.allAlerts')}</Link>
            </div>

            {error && (
                <p className="gh-surface flex items-start gap-2 p-4 text-sm text-[#fcd34d]">
                    <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" /> {t(`steam.errors.${error}`)}
                </p>
            )}
            {!data && loading && <Spinner />}

            {data && (data.private ? (
                <EmptyState icon={BsHeart} title={t('steam.wishlistPrivateTitle')} text={t('steam.wishlistPrivateText')} />
            ) : (
                <>
                    <WatchAll data={data} region={region} onSaved={() => load(false)} />
                    <Summary items={data.items} currency={data.currency} />
                    <WishlistItems items={data.items} region={region} currency={data.currency} alertsByKey={alertsByKey} />
                </>
            ))}
        </div>
    );
}

function LinkSteam() {
    const { t } = useT();
    const { user, setProfile } = useContext(UserContext) || {};
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const submit = async event => {
        event.preventDefault();
        if (!value.trim() || busy) return;
        setBusy(true);
        setError(null);
        try {
            const data = await fetchSteamOwned(value);
            await saveSteamId(user.uid, data.steamId);
            setProfile?.(current => (current ? { ...current, steamId: data.steamId } : current));
        } catch (err) {
            const code = err?.data?.code;
            setError(code === 'invalid_profile' || code === 'not_found' ? 'no_account' : steamErrorCode(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="gh-surface p-6 max-w-xl space-y-3">
            <p className="flex items-center gap-2 font-semibold text-white"><BsSteam aria-hidden="true" /> {t('steam.linkTitle')}</p>
            <p className="text-sm text-[#a1a6b3]">{t('steam.linkText')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input value={value} onChange={e => setValue(e.target.value.slice(0, 200))} placeholder="https://steamcommunity.com/id/…" className={inputClass} />
                <button type="submit" disabled={busy || !value.trim()} className="gh-btn gh-btn-primary shrink-0">{busy ? t('steam.linking') : t('steam.link')}</button>
            </div>
            {error && <p className="text-sm text-[#fcd34d]">{t(`steam.errors.${error}`)}</p>}
        </form>
    );
}

/* ───────── Watch the whole wishlist ───────── */

function WatchAll({ data, region, onSaved }) {
    const { t, locale } = useT();
    const { user } = useContext(UserContext) || {};
    const settings = data.alerts;
    const [enabled, setEnabled] = useState(Boolean(settings?.enabled));
    const [minDiscount, setMinDiscount] = useState(settings?.minDiscount || 1);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const dirty = enabled !== Boolean(settings?.enabled) || (enabled && (minDiscount !== (settings?.minDiscount || 1) || region !== settings?.cc));

    const save = async () => {
        setBusy(true);
        setError(null);
        setResult(null);
        try {
            const res = await saveWishlistAlerts(user, { enabled, minDiscount, cc: region });
            setResult(res);
            onSaved?.();
        } catch (err) {
            setError(steamErrorCode(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="gh-surface p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
                <BsBellFill className="mt-0.5 h-5 w-5 shrink-0 text-[#c4b5fd]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{t('steam.watchAllTitle')}</p>
                    <p className="text-sm text-[#a1a6b3] mt-0.5">{t('steam.watchAllText')}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="peer sr-only" aria-label={t('steam.watchAllTitle')} />
                    <span className="h-6 w-11 rounded-full bg-white/[0.12] peer-checked:bg-[#8b5cf6] transition-colors" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                </label>
            </div>

            {enabled && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c]">{t('prices.minDiscountLabel')}</span>
                    {SALE_DISCOUNTS.map(percent => (
                        <button
                            key={percent}
                            type="button"
                            onClick={() => setMinDiscount(percent)}
                            className={`h-8 px-3 rounded-lg text-xs font-semibold border ${minDiscount === percent ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-[#c4b5fd]' : 'bg-white/[0.04] border-white/[0.08] text-[#c9ccd4] hover:bg-white/[0.08]'}`}
                        >
                            {percent > 1 ? t('prices.saleAtLeast', { percent }) : t('prices.anySale')}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={save} disabled={busy || !dirty} className="gh-btn gh-btn-primary !h-9">
                    {busy ? t('steam.saving') : t('steam.saveWatch')}
                </button>
                {settings?.enabled && settings.lastSyncAt && !dirty && (
                    <span className="text-xs text-[#8a8f9c]">
                        {t('steam.watchStatus', { count: settings.count ?? data.items.length, date: new Date(settings.lastSyncAt).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
                    </span>
                )}
                {result && <span className="text-xs text-[#34d399]">{t('steam.watchSaved', { created: result.created, removed: result.removed })}</span>}
                {error && <span className="text-xs text-[#fcd34d]">{t(`steam.errors.${error}`)}</span>}
            </div>
            {enabled && <EnablePushPrompt compact />}
        </section>
    );
}

/* ───────── Summary ───────── */

function Summary({ items, currency }) {
    const { t, locale } = useT();
    const priced = items.filter(i => i.price);
    const onSale = priced.filter(i => i.price.discount > 0);
    const full = priced.reduce((sum, i) => sum + (i.price.initial || i.price.final), 0);
    const now = priced.reduce((sum, i) => sum + i.price.final, 0);
    const money = amount => formatMoney(Math.round(amount * 100) / 100, currency, locale);
    const tiles = [
        { key: 'games', value: new Intl.NumberFormat(locale).format(items.length) },
        { key: 'onSale', value: new Intl.NumberFormat(locale).format(onSale.length) },
        { key: 'fullPrice', value: currency ? money(full) : '–' },
        { key: 'nowPrice', value: currency ? money(now) : '–', sub: full > now && currency ? money(full - now) : null },
    ];
    return (
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {tiles.map(tile => (
                <div key={tile.key} className="gh-surface px-3 py-3 min-w-0">
                    <dd className="text-xl font-extrabold text-white truncate tabular-nums">{tile.value}</dd>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8f9c] truncate">{t(`steam.summary.${tile.key}`)}</dt>
                    {tile.sub && <p className="text-[11px] text-[#34d399] truncate">{t('steam.youSave', { amount: tile.sub })}</p>}
                </div>
            ))}
        </dl>
    );
}

/* ───────── Items ───────── */

function WishlistItems({ items, region, currency, alertsByKey }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const { byKey, importItems } = useLibrary();
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('added');
    const [search, setSearch] = useState('');
    const [visible, setVisible] = useState(PAGE);
    const [editing, setEditing] = useState(null);
    const [importing, setImporting] = useState(false);
    const [imported, setImported] = useState(null);

    const counts = useMemo(() => ({
        all: items.length,
        onSale: items.filter(i => i.price?.discount > 0).length,
        upcoming: items.filter(i => i.comingSoon).length,
        free: items.filter(i => i.isFree).length,
    }), [items]);

    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items
            .filter(i => filter === 'all' || (filter === 'onSale' ? i.price?.discount > 0 : filter === 'upcoming' ? i.comingSoon : i.isFree))
            .filter(i => !q || i.name.toLowerCase().includes(q))
            .sort(SORTS[sort]);
    }, [items, filter, sort, search]);

    const missing = items.filter(i => !byKey[`steam-${i.appid}`]);

    const importAll = async () => {
        setImporting(true);
        try {
            const count = await importItems(missing.map(i => ({
                gameKey: `steam-${i.appid}`, name: i.name, image: i.image, source: 'steam', sourceId: String(i.appid), platform: 'pc', status: 'wishlist',
            })));
            setImported(count);
        } catch (err) {
            console.error('Wishlist import failed:', err);
        } finally {
            setImporting(false);
        }
    };

    if (!items.length) return <EmptyState icon={BsHeart} title={t('steam.wishlistEmptyTitle')} text={t('steam.wishlistEmptyText')} />;

    const tabs = ['all', 'onSale', 'upcoming', 'free'].filter(key => key === 'all' || counts[key]).map(key => ({ id: key, label: t(`steam.filter.${key}`), count: counts[key] }));

    return (
        <section>
            <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-3">
                <Tabs tabs={tabs} value={filter} onChange={id => { setFilter(id); setVisible(PAGE); }} className="lg:flex-1" />
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative sm:w-56">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7080]" aria-hidden="true" />
                        <input value={search} onChange={e => { setSearch(e.target.value.slice(0, 80)); setVisible(PAGE); }} placeholder={t('steam.search')} className={`${inputClass} pl-8`} />
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('steam.sortLabel')} className={`${inputClass} sm:w-48`}>
                        {Object.keys(SORTS).map(key => <option key={key} value={key}>{t(`steam.sort.${key}`)}</option>)}
                    </select>
                </div>
            </div>

            {missing.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#a1a6b3]">
                    <button type="button" onClick={importAll} disabled={importing} className="gh-btn gh-btn-secondary !h-9">
                        <BsCollection aria-hidden="true" /> {importing ? t('steam.importing') : t('steam.importToLibrary', { count: missing.length })}
                    </button>
                    {imported != null && <span className="text-[#34d399]">{t('steam.imported', { count: imported })}</span>}
                </div>
            )}

            <ul className="grid gap-3 md:grid-cols-2">
                {shown.slice(0, visible).map(item => (
                    <WishlistRow
                        key={item.appid}
                        item={item}
                        alert={alertsByKey[`steam-${item.appid}`]}
                        inLibrary={Boolean(byKey[`steam-${item.appid}`])}
                        currency={currency}
                        onAlert={() => setEditing(item)}
                    />
                ))}
            </ul>
            {shown.length === 0 && <p className="gh-surface p-4 text-sm text-[#8a8f9c]">{t('steam.noMatch')}</p>}
            {shown.length > visible && (
                <button type="button" onClick={() => setVisible(v => v + PAGE)} className="gh-btn gh-btn-secondary w-full mt-3">
                    {t('steam.showMore', { count: shown.length - visible })}
                </button>
            )}

            <AlertModal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                user={user}
                game={editing ? { gameKey: `steam-${editing.appid}`, name: editing.name, image: editing.image, steamAppId: editing.appid } : null}
                cc={region}
                currency={editing?.price?.currency || currency}
                currentPrice={editing?.price?.final ?? null}
                historicalLow={null}
                alert={editing ? alertsByKey[`steam-${editing.appid}`] || null : null}
            />
        </section>
    );
}

function WishlistRow({ item, alert, inLibrary, currency, onAlert }) {
    const { t, locale } = useT();
    const price = item.price;
    const money = amount => formatMoney(amount, price?.currency || currency, locale);
    const release = item.comingSoon
        ? item.comingSoonText || (item.releaseDate ? new Date(item.releaseDate).toLocaleDateString(locale) : t('steam.comingSoon'))
        : null;

    return (
        <li className="gh-surface overflow-hidden flex flex-col sm:flex-row">
            <Link to={`/game/steam/${item.appid}`} className="sm:w-48 shrink-0 aspect-[460/215] bg-[#171a22] overflow-hidden">
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1 p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2 min-w-0">
                    <Link to={`/game/steam/${item.appid}`} className="font-semibold text-white leading-snug line-clamp-2 hover:text-[#c4b5fd]">{item.name}</Link>
                    <a href={`https://store.steampowered.com/app/${item.appid}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#6b7080] hover:text-white" aria-label={t('steam.openStore')}>
                        <BsBoxArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {price?.discount > 0 && <span className="inline-flex items-center h-6 px-1.5 rounded bg-emerald-500 text-[#0a0b0f] text-xs font-extrabold">-{price.discount}%</span>}
                    {price?.discount > 0 && <span className="text-xs text-[#6b7080] line-through tabular-nums">{money(price.initial)}</span>}
                    <span className="text-base font-bold text-white tabular-nums">
                        {price ? money(price.final) : item.isFree ? t('steam.free') : release ? '' : t('steam.noPrice')}
                    </span>
                    {release && <span className="text-xs text-[#fbbf24]">{t('steam.releases', { date: release })}</span>}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                    {item.addedAt && <span className="text-[#6b7080]">{t('steam.added', { date: new Date(item.addedAt).toLocaleDateString(locale) })}</span>}
                    {inLibrary && <span className="inline-flex items-center gap-1 text-[#34d399]"><BsCheck2 aria-hidden="true" /> {t('steam.inLibrary')}</span>}
                    {!item.isFree && (
                        <button type="button" onClick={onAlert} className={`ml-auto inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-semibold border ${alert ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/15 text-[#c4b5fd]' : 'border-white/[0.08] bg-white/[0.04] text-[#c9ccd4] hover:bg-white/[0.08]'}`}>
                            {alert ? <BsBellFill aria-hidden="true" /> : <BsBell aria-hidden="true" />}
                            {alert ? alertTargetText(t, alert, price?.currency || currency, locale) : t('steam.setAlert')}
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}
