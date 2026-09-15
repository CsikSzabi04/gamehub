/* eslint-disable react/prop-types */
// "GameDataHub Wrapped": yearly summary card + shareable PNG (canvas).
import { useEffect, useState } from 'react';
import { BsShare, BsStars, BsTrophy } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Modal } from '../community/ui.jsx';
import { itemHours } from './libraryApi.js';

const W = 1080;
const H = 1350;
const FONT = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
}

function fitText(ctx, text, maxWidth) {
    let value = String(text || '');
    if (ctx.measureText(value).width <= maxWidth) return value;
    while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) value = value.slice(0, -1);
    return `${value}…`;
}

function drawWrapped({ wrapped, t, locale, username, monthName }) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const nf = new Intl.NumberFormat(locale);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#24124f');
    bg.addColorStop(0.55, '#110d24');
    bg.addColorStop(1, '#0a0b0f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, 120, 20, W * 0.85, 120, 560);
    glow.addColorStop(0, 'rgba(139,92,246,0.45)');
    glow.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const pad = 80;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#c4b5fd';
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText('GAMEDATAHUB WRAPPED', pad, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 80px ${FONT}`;
    ctx.fillText(fitText(ctx, t('library.wrapped.cardTitle', { year: wrapped.year }), W - pad * 2), pad, 225);
    if (username) {
        ctx.fillStyle = '#a1a6b3';
        ctx.font = `500 38px ${FONT}`;
        ctx.fillText(fitText(ctx, `@${username}`, W - pad * 2), pad, 285);
    }

    const stats = [
        [nf.format(wrapped.completed), t('library.wrapped.completed')],
        [nf.format(wrapped.hours), t('library.wrapped.hours')],
        [nf.format(wrapped.played), t('library.wrapped.played')],
    ];
    const gap = 24;
    const boxW = (W - pad * 2 - gap * 2) / 3;
    stats.forEach(([value, label], i) => {
        const x = pad + i * (boxW + gap);
        roundRect(ctx, x, 340, boxW, 220, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 92px ${FONT}`;
        ctx.fillText(fitText(ctx, value, boxW - 48), x + 28, 460);
        ctx.fillStyle = '#c9ccd4';
        ctx.font = `500 30px ${FONT}`;
        ctx.fillText(fitText(ctx, label, boxW - 48), x + 28, 520);
    });

    roundRect(ctx, pad, 590, W - pad * 2, 130, 28);
    ctx.fillStyle = 'rgba(139,92,246,0.18)';
    ctx.fill();
    ctx.fillStyle = '#c4b5fd';
    ctx.font = `600 28px ${FONT}`;
    ctx.fillText(t('library.wrapped.activeMonth'), pad + 32, 640);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 48px ${FONT}`;
    ctx.fillText(fitText(ctx, monthName || '–', W - pad * 2 - 64), pad + 32, 698);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText(t('library.wrapped.topGames'), pad, 810);
    const rows = wrapped.topGames.slice(0, 5);
    if (!rows.length) {
        ctx.fillStyle = '#a1a6b3';
        ctx.font = `500 32px ${FONT}`;
        ctx.fillText(t('library.wrapped.noTop'), pad, 875);
    }
    rows.forEach((item, i) => {
        const y = 880 + i * 82;
        roundRect(ctx, pad, y - 50, W - pad * 2, 70, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fill();
        ctx.fillStyle = '#8b5cf6';
        ctx.font = `800 34px ${FONT}`;
        ctx.fillText(String(i + 1), pad + 26, y - 4);
        const hours = itemHours(item);
        const right = hours ? t('library.hoursShort', { hours: nf.format(Math.round(hours)) }) : item.rating ? '★'.repeat(item.rating) : '';
        ctx.font = `600 30px ${FONT}`;
        const rightW = right ? ctx.measureText(right).width : 0;
        ctx.fillStyle = '#a1a6b3';
        if (right) ctx.fillText(right, W - pad - 26 - rightW, y - 4);
        ctx.fillStyle = '#eceef2';
        ctx.font = `600 32px ${FONT}`;
        ctx.fillText(fitText(ctx, item.name, W - pad * 2 - 110 - rightW - 30), pad + 80, y - 4);
    });

    ctx.fillStyle = '#6b7080';
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText('gamedatahub.netlify.app', pad, H - 60);
    return canvas;
}

const toBlob = canvas => new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), 'image/png');
});

export default function WrappedCard({ wrapped, username }) {
    const { t, locale } = useT();
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const nf = new Intl.NumberFormat(locale);
    const monthName = wrapped.mostActiveMonth != null
        ? new Date(wrapped.year, wrapped.mostActiveMonth, 1).toLocaleDateString(locale, { month: 'long' })
        : null;

    const share = async () => {
        setBusy(true);
        const canTryShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
        // Open the tab inside the click so popup blockers allow it
        const tab = canTryShare ? null : window.open('', '_blank');
        try {
            const blob = await toBlob(drawWrapped({ wrapped, t, locale, username, monthName }));
            const file = new File([blob], `gamedatahub-wrapped-${wrapped.year}.png`, { type: 'image/png' });
            if (canTryShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: t('library.wrapped.cardTitle', { year: wrapped.year }) });
                    return;
                } catch (error) {
                    if (error?.name === 'AbortError') return;
                }
            }
            const url = URL.createObjectURL(blob);
            if (tab) tab.location.href = url;
            else setPreview(url);
        } catch (error) {
            console.error('Wrapped export failed:', error);
            tab?.close();
        } finally {
            setBusy(false);
        }
    };

    const empty = !wrapped.completed && !wrapped.played;

    return (
        <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
                <div>
                    <p className="gh-eyebrow mb-1">{t('library.wrapped.eyebrow')}</p>
                    <h2 className="gh-section-title">{t('library.wrapped.title', { year: wrapped.year })}</h2>
                </div>
                {!empty && (
                    <button type="button" onClick={share} disabled={busy} className="gh-btn gh-btn-primary w-full sm:w-auto">
                        <BsShare aria-hidden="true" />
                        {busy ? t('library.wrapped.creating') : t('library.wrapped.share')}
                    </button>
                )}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#24124f] via-[#110d24] to-[#0a0b0f] p-5 sm:p-7">
                <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#8b5cf6]/30 blur-3xl" aria-hidden="true" />
                {empty ? (
                    <div className="relative text-center py-8">
                        <BsStars className="mx-auto text-4xl text-[#c4b5fd] mb-3" aria-hidden="true" />
                        <p className="text-white font-semibold">{t('library.wrapped.emptyTitle')}</p>
                        <p className="text-sm text-[#a1a6b3] mt-1.5 max-w-md mx-auto">{t('library.wrapped.emptyText')}</p>
                    </div>
                ) : (
                    <div className="relative grid gap-5 lg:grid-cols-[1fr_1.1fr]">
                        <div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {[
                                    [wrapped.completed, t('library.wrapped.completed')],
                                    [wrapped.hours, t('library.wrapped.hours')],
                                    [wrapped.played, t('library.wrapped.played')],
                                ].map(([value, label]) => (
                                    <div key={label} className="rounded-xl bg-white/[0.07] px-3 py-3 sm:px-4 sm:py-4 min-w-0">
                                        <p className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums truncate">{nf.format(value)}</p>
                                        <p className="text-[11px] sm:text-sm text-[#c9ccd4] mt-1 leading-tight">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 rounded-xl bg-[#8b5cf6]/[0.18] px-4 py-3">
                                <p className="text-xs font-semibold text-[#c4b5fd]">{t('library.wrapped.activeMonth')}</p>
                                <p className="text-xl sm:text-2xl font-extrabold text-white capitalize">{monthName || '–'}</p>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <BsTrophy className="text-[#fbbf24]" aria-hidden="true" />
                                {t('library.wrapped.topGames')}
                            </p>
                            {wrapped.topGames.length ? (
                                <ol className="space-y-1.5">
                                    {wrapped.topGames.map((item, i) => {
                                        const hours = itemHours(item);
                                        return (
                                            <li key={item.gameKey} className="flex items-center gap-3 rounded-lg bg-white/[0.05] px-3 h-11 min-w-0">
                                                <span className="w-5 shrink-0 text-sm font-extrabold text-[#8b5cf6]">{i + 1}</span>
                                                <span className="flex-1 min-w-0 truncate text-sm text-[#eceef2]">{item.name}</span>
                                                {hours > 0 && (
                                                    <span className="shrink-0 text-xs text-[#a1a6b3] tabular-nums">
                                                        {t('library.hoursShort', { hours: nf.format(Math.round(hours)) })}
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-sm text-[#a1a6b3]">{t('library.wrapped.noTop')}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={t('library.wrapped.previewTitle')} subtitle={t('library.wrapped.previewHint')}>
                {preview && (
                    <div className="space-y-4">
                        <img src={preview} alt={t('library.wrapped.cardTitle', { year: wrapped.year })} className="w-full rounded-xl border border-white/[0.08]" />
                        <a href={preview} target="_blank" rel="noopener noreferrer" download={`gamedatahub-wrapped-${wrapped.year}.png`} className="gh-btn gh-btn-secondary w-full">
                            {t('library.wrapped.open')}
                        </a>
                    </div>
                )}
            </Modal>
        </section>
    );
}
