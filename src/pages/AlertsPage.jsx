/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsBellFill, BsPauseFill, BsPencilFill, BsPlayFill, BsSteam, BsTrash3Fill } from 'react-icons/bs';
import { PageShell, RequireLogin, Spinner, EmptyState } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';
import { toDate } from '../lib/firebase.js';
import { gameHref, steamHeader } from '../lib/games.js';
import AlertModal from '../prices/AlertModal.jsx';
import { alertReached, alertTargetText, formatMoney, removeAlert, steamPriceUrl, updateAlert, usePriceAlerts } from '../prices/priceUtils.js';

export default function AlertsPage() {
    const { t } = useT();
    return (
        <PageShell eyebrow={t('prices.pageEyebrow')} title={t('prices.pageTitle')} subtitle={t('prices.pageSubtitle')}>
            <RequireLogin>
                <AlertsList />
            </RequireLogin>
        </PageShell>
    );
}

function AlertsList() {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const { alerts, loading, error } = usePriceAlerts(user);
    const [editing, setEditing] = useState(null); // { alert, currentPrice, currency }

    return (
        <div className="space-y-5">
            <EnablePushPrompt />

            <Link to="/wishlist" className="gh-surface flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors">
                <BsSteam className="h-5 w-5 shrink-0 text-[#c7d5e0]" aria-hidden="true" />
                <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{t('prices.wishlistCta')}</span>
                    <span className="block text-xs text-[#8a8f9c]">{t('prices.wishlistCtaText')}</span>
                </span>
            </Link>

            {loading && <Spinner />}
            {!loading && error && <p className="gh-surface p-4 text-sm text-red-400">{t('prices.loadError')}</p>}

            {!loading && !error && alerts.length === 0 && (
                <EmptyState
                    icon={BsBellFill}
                    title={t('prices.emptyTitle')}
                    text={t('prices.emptyText')}
                    action={<Link to="/hub" className="gh-btn gh-btn-primary inline-flex">{t('prices.browseDeals')}</Link>}
                />
            )}

            {!loading && alerts.length > 0 && (
                <>
                    <p className="text-sm text-[#a1a6b3]">{t('prices.count', { count: alerts.length })}</p>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {alerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} user={user} onEdit={setEditing} />
                        ))}
                    </ul>
                </>
            )}

            <AlertModal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                user={user}
                game={editing ? {
                    gameKey: editing.alert.gameKey || editing.alert.id,
                    name: editing.alert.name,
                    image: editing.alert.image,
                    steamAppId: editing.alert.steamAppId,
                } : null}
                cc={editing?.alert.cc || 'hu'}
                currency={editing?.currency || editing?.alert.currency || null}
                currentPrice={editing?.currentPrice ?? null}
                historicalLow={editing?.historicalLow ?? null}
                alert={editing?.alert || null}
            />
        </div>
    );
}

function AlertCard({ alert, user, onEdit }) {
    const { t, locale } = useT();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const live = useApi(alert.steamAppId ? steamPriceUrl(alert.steamAppId, alert.cc || 'hu') : null).data;

    const currency = live?.currency || alert.currency || null;
    const nowPrice = live?.current?.final ?? null;
    const lowest = live?.itad?.lowest && live.itad.lowest.currency === currency ? live.itad.lowest.amount : null;
    const money = amount => formatMoney(amount, alert.currency || currency, locale);
    const paused = alert.active === false;
    const saleMode = alert.mode === 'sale';
    const reference = nowPrice ?? alert.lastPrice;
    const triggered = !paused && (saleMode
        ? alertReached(alert, { final: reference, discount: live?.current?.discount ?? alert.lastDiscount ?? 0 }, currency)
        : typeof reference === 'number' && reference <= alert.targetPrice);
    const checked = toDate(alert.lastCheckedAt);
    const href = gameHref(alert.gameKey || alert.id);
    const image = alert.image || (alert.steamAppId ? steamHeader(alert.steamAppId) : null);

    const status = paused
        ? { label: t('prices.statusPaused'), className: 'bg-white/[0.06] text-[#a1a6b3] border-white/[0.08]' }
        : triggered
            ? { label: t('prices.statusTriggered'), className: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' }
            : { label: t('prices.statusWatching'), className: 'bg-[#8b5cf6]/15 text-[#c4b5fd] border-[#8b5cf6]/30' };

    const run = async action => {
        setBusy(true);
        try {
            await action();
        } catch (error) {
            console.error('Price alert update failed:', error);
        } finally {
            setBusy(false);
        }
    };

    return (
        <li className="gh-surface overflow-hidden flex flex-col">
            <Link to={href} className="flex gap-3 p-3 sm:p-4 hover:bg-white/[0.02] transition-colors" aria-label={`${t('prices.openGame')}: ${alert.name}`}>
                <div className="w-28 sm:w-32 aspect-[460/215] rounded-lg overflow-hidden bg-[#171a22] shrink-0">
                    {image && <img src={image} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-white leading-snug line-clamp-2">{alert.name}</p>
                        <span className={`shrink-0 inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {live?.current?.discount > 0 && (
                            <span className="inline-flex items-center h-5 px-1.5 rounded bg-emerald-500 text-[#0a0b0f] text-[11px] font-extrabold">-{live.current.discount}%</span>
                        )}
                        {alert.source === 'wishlist' && (
                            <span className="inline-flex items-center h-5 px-1.5 rounded border border-white/[0.1] text-[10px] font-semibold text-[#a1a6b3]">{t('prices.fromWishlist')}</span>
                        )}
                    </div>
                    {checked && (
                        <p className="text-[11px] text-[#6b7080] mt-1.5">
                            {t('prices.checkedAt', { date: checked.toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
                        </p>
                    )}
                </div>
            </Link>

            <dl className="grid grid-cols-3 gap-2 px-3 sm:px-4 pb-3 text-center">
                <Stat label={t('prices.targetLabel')} value={saleMode ? alertTargetText(t, alert, currency, locale) : money(alert.targetPrice)} accent="text-[#c4b5fd]" />
                <Stat label={t('prices.lastKnown')} value={typeof alert.lastPrice === 'number' ? money(alert.lastPrice) : '–'} />
                <Stat label={t('prices.nowLabel')} value={nowPrice != null ? formatMoney(nowPrice, currency, locale) : '–'} accent={triggered ? 'text-emerald-300' : 'text-white'} />
            </dl>

            <div className="mt-auto flex items-center gap-1.5 border-t border-white/[0.06] px-2 sm:px-3 py-2">
                {confirming ? (
                    <>
                        <span className="text-xs text-[#a1a6b3] mr-auto pl-1">{t('prices.confirmDelete')}</span>
                        <button type="button" onClick={() => setConfirming(false)} className="h-9 px-3 rounded-lg text-xs font-semibold text-[#c9ccd4] hover:bg-white/[0.06]">
                            {t('prices.cancel')}
                        </button>
                        <button type="button" disabled={busy} onClick={() => run(() => removeAlert(user, alert.id))} className="gh-btn gh-btn-danger !h-9 !px-3 text-xs">
                            <BsTrash3Fill className="w-3.5 h-3.5" aria-hidden="true" />
                            {t('prices.delete')}
                        </button>
                    </>
                ) : (
                    <>
                        <CardButton icon={BsPencilFill} label={t('prices.edit')} onClick={() => onEdit({ alert, currentPrice: nowPrice, currency, historicalLow: lowest })} />
                        <CardButton
                            icon={paused ? BsPlayFill : BsPauseFill}
                            label={paused ? t('prices.resume') : t('prices.pause')}
                            disabled={busy}
                            onClick={() => run(() => updateAlert(user, alert.id, { active: paused }))}
                        />
                        <CardButton icon={BsTrash3Fill} label={t('prices.delete')} onClick={() => setConfirming(true)} className="ml-auto hover:!text-red-400" />
                    </>
                )}
            </div>
        </li>
    );
}

function Stat({ label, value, accent = 'text-white' }) {
    return (
        <div className="rounded-lg bg-white/[0.03] px-1.5 py-2 min-w-0">
            <dt className="text-[10px] uppercase tracking-wide text-[#6b7080] truncate">{label}</dt>
            <dd className={`text-sm font-bold tabular-nums truncate ${accent}`}>{value}</dd>
        </div>
    );
}

function CardButton({ icon: Icon, label, onClick, disabled, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold text-[#c9ccd4] hover:bg-white/[0.06] hover:text-white disabled:opacity-50 transition-colors ${className}`}
        >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
        </button>
    );
}
