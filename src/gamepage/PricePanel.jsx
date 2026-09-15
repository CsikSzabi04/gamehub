/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsBellFill, BsBoxArrowUpRight, BsGraphDownArrow, BsTagFill } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';
import Sparkline from '../prices/Sparkline.jsx';
import AlertModal from '../prices/AlertModal.jsx';
import { PRICE_REGIONS, alertReached, alertTargetText, formatMoney, priceVerdict, regionName, searchPriceUrl, steamPriceUrl, usePriceAlert, usePriceRegion } from '../prices/priceUtils.js';

const VERDICT_STYLES = {
    best: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    good: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    wait: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
};
const VERDICT_KEYS = { best: 'prices.verdictBest', good: 'prices.verdictGood', wait: 'prices.verdictWait' };

/** Aside card on the game page: live price, historical low, verdict, history chart and price alert. */
export default function PricePanel({ game }) {
    const { t, locale } = useT();
    const { user } = useContext(UserContext) || {};
    const [cc, setCc] = usePriceRegion();
    const [modalOpen, setModalOpen] = useState(false);

    const appid = Number(game?.steamAppId) || (game?.source === 'steam' ? Number(game.id) : 0) || null;
    const steam = useApi(appid ? steamPriceUrl(appid, cc) : null);
    const search = useApi(!appid && game?.name ? searchPriceUrl(game.name, cc) : null);
    const alert = usePriceAlert(appid ? user : null, game?.gameKey);

    if (!game) return null;

    /* ── non-Steam (GOG without a Steam id): IsThereAnyDeal only, no alert ── */
    if (!appid) {
        const itad = search.data?.found ? search.data.itad : null;
        if (!itad?.bestCurrent && !itad?.lowest) return null;
        return (
            <div className="gh-surface p-4 sm:p-5">
                <PanelHeader t={t} locale={locale} cc={cc} setCc={setCc} />
                <ItadInfo t={t} locale={locale} itad={itad} />
            </div>
        );
    }

    const data = steam.data;
    if (data?.isFree) return null;
    const currency = data?.currency || null;
    const current = data?.current || null;
    const itad = data?.itad || null;
    const money = amount => formatMoney(amount, currency, locale);
    const verdict = priceVerdict(data);
    const lowest = itad?.lowest && (!currency || itad.lowest.currency === currency) ? itad.lowest : null;

    const alertButton = !user ? (
        <Link to="/login" className="gh-btn gh-btn-secondary w-full">
            <BsBellFill className="w-4 h-4" aria-hidden="true" />
            {t('prices.loginToAlert')}
        </Link>
    ) : (
        <button type="button" onClick={() => setModalOpen(true)} disabled={alert === undefined} className="gh-btn gh-btn-secondary w-full">
            <BsBellFill className={`w-4 h-4 ${alert?.active !== false && alert ? 'text-[#c4b5fd]' : ''}`} aria-hidden="true" />
            {alert ? t('prices.editAlert') : t('prices.setAlert')}
        </button>
    );

    return (
        <div className="gh-surface p-4 sm:p-5">
            <PanelHeader t={t} locale={locale} cc={cc} setCc={setCc} />

            {steam.loading && (
                <div className="animate-pulse space-y-2 mb-4" aria-hidden="true">
                    <div className="h-8 w-28 rounded-md bg-white/[0.06]" />
                    <div className="h-4 w-40 rounded bg-white/[0.04]" />
                </div>
            )}

            {!steam.loading && !data && (
                <p className="text-sm text-[#a1a6b3] mb-4">{t('prices.unavailable')}</p>
            )}

            {data && (
                <div className="mb-4">
                    <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums leading-none">
                            {current ? money(current.final) : t('prices.noPrice')}
                        </span>
                        {current?.discount > 0 && (
                            <>
                                <span className="text-sm text-[#6b7080] line-through tabular-nums">{money(current.initial)}</span>
                                <span className="inline-flex items-center h-6 px-2 rounded-md bg-emerald-500 text-[#0a0b0f] text-xs font-extrabold">-{current.discount}%</span>
                            </>
                        )}
                    </div>

                    {verdict && current && (
                        <span className={`mt-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-semibold ${VERDICT_STYLES[verdict]}`}>
                            <BsGraphDownArrow className="w-3.5 h-3.5" aria-hidden="true" />
                            {t(VERDICT_KEYS[verdict])}
                        </span>
                    )}

                    {itad?.history?.length > 0 && (
                        <div className="mt-4">
                            <Sparkline
                                points={itad.history}
                                current={current?.final}
                                label={t('prices.chartLabel')}
                                startLabel={t('prices.yearAgo')}
                                endLabel={t('prices.today')}
                                formatValue={money}
                            />
                        </div>
                    )}

                    {lowest && (
                        <div className="mt-4 flex items-start justify-between gap-3 text-sm">
                            <div className="min-w-0">
                                <p className="text-[#a1a6b3]">{t('prices.historicalLow')}</p>
                                <p className="text-xs text-[#6b7080] truncate">
                                    {t('prices.lowMeta', { date: formatDate(lowest.date, locale), shop: lowest.shop || '–' })}
                                </p>
                            </div>
                            <span className="font-bold text-emerald-300 tabular-nums shrink-0">{money(lowest.amount)}</span>
                        </div>
                    )}

                    {itad?.bestCurrent && <BestDeal t={t} locale={locale} deal={itad.bestCurrent} />}
                </div>
            )}

            {alert && (
                <p className="text-xs text-[#a1a6b3] mb-2 flex items-center gap-1.5">
                    <BsTagFill className="w-3 h-3 text-[#c4b5fd]" aria-hidden="true" />
                    {alert.active === false
                        ? t('prices.alertPaused')
                        : alertReached(alert, current, currency)
                            ? t('prices.alertTriggered')
                            : t('prices.alertAt', { price: alertTargetText(t, alert, currency, locale) })}
                </p>
            )}
            {alertButton}

            {user && (
                <AlertModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    user={user}
                    game={{ gameKey: game.gameKey, name: game.name, image: game.image, steamAppId: appid }}
                    cc={cc}
                    currency={currency}
                    currentPrice={current?.final ?? null}
                    historicalLow={lowest?.amount ?? null}
                    alert={alert || null}
                />
            )}
        </div>
    );
}

function formatDate(value, locale) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : '–';
}

function PanelHeader({ t, locale, cc, setCc }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8a8f9c]">{t('prices.panelTitle')}</h3>
            <label className="relative">
                <span className="sr-only">{t('prices.region')}</span>
                <select
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    title={t('prices.region')}
                    className="h-8 max-w-[9.5rem] rounded-lg bg-[#0a0b0f] border border-white/[0.1] pl-2 pr-6 text-xs text-[#c9ccd4] focus:outline-none focus:border-[#8b5cf6] truncate"
                >
                    {PRICE_REGIONS.map(code => (
                        <option key={code} value={code}>{regionName(code, locale)}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}

function BestDeal({ t, locale, deal }) {
    const content = (
        <>
            <div className="min-w-0">
                <p className="text-[#a1a6b3]">{t('prices.bestDeal')}</p>
                <p className="text-xs text-[#6b7080] truncate">
                    {deal.shop ? t('prices.atShop', { shop: deal.shop }) : ''}
                    {deal.cut > 0 ? ` · -${deal.cut}%` : ''}
                </p>
            </div>
            <span className="flex items-center gap-1.5 font-bold text-white tabular-nums shrink-0">
                {formatMoney(deal.amount, deal.currency, locale)}
                {deal.url && <BsBoxArrowUpRight className="w-3 h-3 text-[#8a8f9c]" aria-hidden="true" />}
            </span>
        </>
    );
    const className = 'mt-3 flex items-start justify-between gap-3 text-sm rounded-lg -mx-2 px-2 py-1.5';
    if (!deal.url) return <div className={className}>{content}</div>;
    return (
        <a href={deal.url} target="_blank" rel="noopener noreferrer sponsored" className={`${className} hover:bg-white/[0.04] transition-colors`} aria-label={`${t('prices.viewDeal')}: ${deal.shop || ''}`}>
            {content}
        </a>
    );
}

function ItadInfo({ t, locale, itad }) {
    return (
        <div>
            {itad.bestCurrent && (
                <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums leading-none">
                        {formatMoney(itad.bestCurrent.amount, itad.bestCurrent.currency, locale)}
                    </span>
                    {itad.bestCurrent.cut > 0 && (
                        <span className="inline-flex items-center h-6 px-2 rounded-md bg-emerald-500 text-[#0a0b0f] text-xs font-extrabold">-{itad.bestCurrent.cut}%</span>
                    )}
                </div>
            )}
            {itad.bestCurrent && <BestDeal t={t} locale={locale} deal={itad.bestCurrent} />}
            {itad.lowest && (
                <div className="mt-3 flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                        <p className="text-[#a1a6b3]">{t('prices.historicalLow')}</p>
                        <p className="text-xs text-[#6b7080] truncate">
                            {t('prices.lowMeta', { date: formatDate(itad.lowest.date, locale), shop: itad.lowest.shop || '–' })}
                        </p>
                    </div>
                    <span className="font-bold text-emerald-300 tabular-nums shrink-0">{formatMoney(itad.lowest.amount, itad.lowest.currency, locale)}</span>
                </div>
            )}
            {itad.page && (
                <a href={itad.page} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#c4b5fd] hover:text-white">
                    {t('prices.allDeals')}
                    <BsBoxArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </a>
            )}
        </div>
    );
}
