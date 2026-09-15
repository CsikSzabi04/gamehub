import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsClock,
    BsController,
    BsDashCircleFill,
    BsExclamationTriangle,
    BsEye,
    BsFlag,
    BsHandThumbsUp,
    BsHandThumbsUpFill,
    BsPencil,
    BsPlusCircleFill,
    BsTrash,
} from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Stars } from './Stars.jsx';
import { ASPECTS } from './reviewUtils.js';

function AspectBars({ aspects }) {
    const { t } = useT();
    const rated = ASPECTS.filter(key => aspects?.[key] != null);
    if (!rated.length) return null;
    return (
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {rated.map(key => (
                <li key={key} className="flex items-center gap-2 text-xs">
                    <span className="w-24 sm:w-28 shrink-0 truncate text-[#a1a6b3]">{t(`reviewsPlus.aspects.${key}`)}</span>
                    <span className="flex flex-1 gap-0.5" role="img" aria-label={t('reviewsPlus.outOfFive', { value: aspects[key] })}>
                        {[1, 2, 3, 4, 5].map(step => (
                            <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= aspects[key] ? 'bg-[#8b5cf6]' : 'bg-white/[0.07]'}`} />
                        ))}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function TagList({ items, positive }) {
    const { t } = useT();
    if (!items?.length) return null;
    const Icon = positive ? BsPlusCircleFill : BsDashCircleFill;
    return (
        <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>
                {t(positive ? 'reviewsPlus.pros' : 'reviewsPlus.cons')}
            </p>
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#c9ccd4]">
                        <Icon aria-hidden="true" className={`mt-[3px] shrink-0 text-xs ${positive ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <span className="min-w-0 break-words">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * One review. Actions are optional: pass handlers only when the backend supports them.
 */
export default function ReviewCard({ review, isOwn, voted, onVote, onReport, onEdit, onDelete }) {
    const { t, locale } = useT();
    const [revealed, setRevealed] = useState(false);
    const [busy, setBusy] = useState(false);

    const name = review.username || t('reviewsPlus.player');
    const created = review.createdAt ? new Date(review.createdAt) : null;
    const hours = Number(review.playtimeHours);
    const hidden = review.spoiler && !revealed;

    async function run(action) {
        if (busy) return;
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
        }
    }

    function handleDelete() {
        if (window.confirm(t('reviewsPlus.deleteConfirm'))) run(() => onDelete(review.id));
    }

    const author = (
        <span className="truncate text-sm font-semibold text-white">
            {name}
            {isOwn && <span className="ml-1.5 text-xs font-medium text-[#c4b5fd]">({t('reviewsPlus.you')})</span>}
        </span>
    );

    return (
        <article className="gh-surface p-4 sm:p-5">
            <header className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1e222c] text-sm font-semibold text-[#c4b5fd]" aria-hidden="true">
                    {(name.trim()[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        {review.username ? (
                            <Link to={`/u/${encodeURIComponent(review.username)}`} className="min-w-0 hover:underline decoration-white/30 underline-offset-2">
                                {author}
                            </Link>
                        ) : author}
                        <Stars value={review.rating} className="text-xs" />
                    </div>
                    {created && !Number.isNaN(created.getTime()) && (
                        <p className="text-xs text-[#6b7080] mt-0.5">
                            {created.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                            {review.updatedAt && <span> · {t('reviewsPlus.edited')}</span>}
                        </p>
                    )}
                </div>
            </header>

            {(Number.isFinite(hours) && review.playtimeHours != null) || review.platform || review.spoiler ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {review.playtimeHours != null && Number.isFinite(hours) && (
                        <span className="gh-chip"><BsClock aria-hidden="true" />{t('reviewsPlus.playtime', { hours: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(hours) })}</span>
                    )}
                    {review.platform && (
                        <span className="gh-chip"><BsController aria-hidden="true" />{t(`reviewsPlus.platforms.${review.platform}`)}</span>
                    )}
                    {review.spoiler && (
                        <span className="gh-chip !text-amber-300 !border-amber-400/25"><BsExclamationTriangle aria-hidden="true" />{t('reviewsPlus.spoilerBadge')}</span>
                    )}
                </div>
            ) : null}

            <div className={`relative mt-3 ${hidden ? 'min-h-[5.5rem]' : ''}`}>
                <div className={hidden ? 'blur-md select-none pointer-events-none' : ''} aria-hidden={hidden}>
                    <p className="text-sm leading-relaxed text-[#c9ccd4] whitespace-pre-line break-words">{review.review}</p>
                    {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <TagList items={review.pros} positive />
                            <TagList items={review.cons} />
                        </div>
                    )}
                </div>
                {hidden && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-xs text-[#c9ccd4]">{t('reviewsPlus.spoilerHidden')}</p>
                        <button type="button" onClick={() => setRevealed(true)} className="gh-btn gh-btn-secondary !h-9 text-xs">
                            <BsEye aria-hidden="true" />
                            {t('reviewsPlus.showSpoiler')}
                        </button>
                    </div>
                )}
            </div>

            <AspectBars aspects={review.aspects} />

            {(onVote || onReport || (isOwn && (onEdit || onDelete))) && (
                <footer className="mt-4 flex flex-wrap items-center gap-2">
                    {onVote && (
                        <button
                            type="button"
                            onClick={() => run(() => onVote(review.id))}
                            disabled={isOwn || busy}
                            aria-pressed={Boolean(voted)}
                            title={t('reviewsPlus.helpfulHint')}
                            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${voted ? 'bg-[#8b5cf6]/15 border-[#8b5cf6]/40 text-[#c4b5fd]' : 'bg-white/[0.04] border-white/[0.08] text-[#c9ccd4] hover:bg-white/[0.08]'}`}
                        >
                            {voted ? <BsHandThumbsUpFill aria-hidden="true" /> : <BsHandThumbsUp aria-hidden="true" />}
                            {t('reviewsPlus.helpful', { count: review.helpfulCount || 0 })}
                        </button>
                    )}
                    <span className="flex-1" />
                    {isOwn && onEdit && (
                        <button type="button" onClick={() => onEdit(review)} className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-medium text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]">
                            <BsPencil aria-hidden="true" />
                            {t('reviewsPlus.edit')}
                        </button>
                    )}
                    {isOwn && onDelete && (
                        <button type="button" onClick={handleDelete} disabled={busy} className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-medium text-[#a1a6b3] hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                            <BsTrash aria-hidden="true" />
                            {t('reviewsPlus.delete')}
                        </button>
                    )}
                    {!isOwn && onReport && (
                        <button type="button" onClick={() => onReport(review)} className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-medium text-[#6b7080] hover:text-[#c9ccd4] hover:bg-white/[0.06]">
                            <BsFlag aria-hidden="true" />
                            {t('reviewsPlus.report')}
                        </button>
                    )}
                </footer>
            )}
        </article>
    );
}
