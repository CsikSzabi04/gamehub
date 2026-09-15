/* eslint-disable react/prop-types */
import { useState } from 'react';
import { BsBellFill, BsCheckCircleFill } from 'react-icons/bs';
import { Modal, Field, inputClass } from '../community/ui.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { useT } from '../i18n/index.jsx';
import { buildAlertDoc, formatMoney, removeAlert, roundPrice, saveAlert } from './priceUtils.js';

/**
 * Create / edit / remove the price alert of one game.
 * game: { gameKey, name, image, steamAppId }
 */
export default function AlertModal({ open, onClose, user, game, cc, currency, currentPrice, historicalLow, alert }) {
    const { t } = useT();
    return (
        <Modal open={open} onClose={onClose} title={t('prices.modalTitle')} subtitle={t('prices.modalSubtitle', { name: game?.name || '' })} maxWidth="max-w-md">
            {open && game && (
                <AlertForm
                    onClose={onClose}
                    user={user}
                    game={game}
                    cc={cc}
                    currency={currency}
                    currentPrice={currentPrice}
                    historicalLow={historicalLow}
                    alert={alert}
                />
            )}
        </Modal>
    );
}

function AlertForm({ onClose, user, game, cc, currency, currentPrice, historicalLow, alert }) {
    const { t, locale } = useT();
    const hasCurrent = typeof currentPrice === 'number' && currentPrice > 0;
    // an alert saved in another region keeps its own currency until it is saved again here
    const sameCurrency = alert && (!alert.currency || !currency || alert.currency === currency);
    const [target, setTarget] = useState(() => {
        if (sameCurrency && alert?.targetPrice) return String(alert.targetPrice);
        return hasCurrent ? String(roundPrice(currentPrice * 0.75)) : '';
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const money = amount => formatMoney(amount, currency, locale);
    const value = Number(String(target).replace(',', '.'));
    const valid = Number.isFinite(value) && value > 0 && value < 1e7;

    const chips = hasCurrent
        ? [25, 50, 75].map(cut => ({ id: `-${cut}`, label: `-${cut}%`, price: roundPrice(currentPrice * (1 - cut / 100)) }))
        : [];
    if (typeof historicalLow === 'number' && historicalLow > 0 && (!hasCurrent || historicalLow < currentPrice)) {
        chips.push({ id: 'low', label: t('prices.quickLow'), price: roundPrice(historicalLow) });
    }

    const submit = async event => {
        event.preventDefault();
        if (!valid) {
            setError(t('prices.invalid'));
            return;
        }
        setBusy(true);
        setError('');
        try {
            const data = buildAlertDoc({ game, cc, currency, targetPrice: value, lastPrice: hasCurrent ? currentPrice : alert?.lastPrice });
            await saveAlert(user, data, !alert);
            setSaved(true);
        } catch (err) {
            console.error('Price alert save failed:', err);
            setError(t('prices.saveError'));
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        setBusy(true);
        try {
            await removeAlert(user, game.gameKey);
            onClose();
        } catch (err) {
            console.error('Price alert remove failed:', err);
            setError(t('prices.saveError'));
            setBusy(false);
        }
    };

    if (saved) {
        return (
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <BsCheckCircleFill className="text-emerald-400 w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-white">{t('prices.savedTitle')}</p>
                        <p className="text-sm text-[#a1a6b3] mt-1">{t('prices.savedText', { price: money(roundPrice(value)) })}</p>
                    </div>
                </div>
                <EnablePushPrompt compact />
                <button type="button" onClick={onClose} className="gh-btn gh-btn-primary w-full">{t('prices.done')}</button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label={t('prices.target')} hint={hasCurrent ? t('prices.currentHint', { price: money(currentPrice) }) : undefined}>
                <div className="relative">
                    <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={target}
                        onChange={e => setTarget(e.target.value.replace(/[^\d.,]/g, '').slice(0, 10))}
                        className={`${inputClass} !h-12 !text-lg font-semibold tabular-nums ${currency ? 'pr-16' : ''}`}
                        aria-invalid={Boolean(error)}
                    />
                    {currency && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7080]">{currency}</span>}
                </div>
            </Field>

            {chips.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('prices.quickPicks')}</p>
                    <div className="flex flex-wrap gap-2">
                        {chips.map(chip => (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => { setTarget(String(chip.price)); setError(''); }}
                                className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-colors ${valid && roundPrice(value) === chip.price ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-[#c4b5fd]' : 'bg-white/[0.04] border-white/[0.08] text-[#c9ccd4] hover:bg-white/[0.08]'}`}
                            >
                                {chip.label} <span className="text-[#8a8f9c] font-medium ml-1 tabular-nums">{money(chip.price)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {valid && hasCurrent && value >= currentPrice && <p className="text-xs text-amber-300/90">{t('prices.aboveCurrent')}</p>}
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                {alert && (
                    <button type="button" onClick={remove} disabled={busy} className="gh-btn gh-btn-danger w-full sm:w-auto">
                        {t('prices.remove')}
                    </button>
                )}
                <button type="submit" disabled={busy || !valid} className="gh-btn gh-btn-primary w-full sm:flex-1">
                    <BsBellFill className="w-4 h-4" aria-hidden="true" />
                    {busy ? t('prices.saving') : t('prices.save')}
                </button>
            </div>
        </form>
    );
}
