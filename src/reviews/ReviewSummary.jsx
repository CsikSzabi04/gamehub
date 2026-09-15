import { BsHandThumbsUpFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Stars } from './Stars.jsx';
import { ASPECTS, hasAspects } from './reviewUtils.js';

/** Average, rating distribution, "% recommend" and aspect averages of a game's reviews. */
export default function ReviewSummary({ summary }) {
    const { t, locale } = useT();
    if (!summary?.count) return null;

    const one = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const whole = new Intl.NumberFormat(locale);
    const distribution = summary.distribution || {};
    const rated = [1, 2, 3, 4, 5].reduce((sum, star) => sum + (distribution[star] || 0), 0);

    return (
        <div className="gh-surface p-4 sm:p-5 mb-4">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-1.5 sm:pr-6 sm:border-r sm:border-white/[0.06]">
                    <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none tabular-nums">
                        {summary.average != null ? one.format(summary.average) : '–'}
                    </p>
                    <div className="min-w-0">
                        <Stars value={summary.average} className="text-base" />
                        <p className="text-xs text-[#a1a6b3] mt-1">{t('reviewsPlus.reviewCount', { count: summary.count })}</p>
                        {summary.recommendedPct != null && (
                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                <BsHandThumbsUpFill aria-hidden="true" />
                                {t('reviewsPlus.recommend', { pct: summary.recommendedPct })}
                            </p>
                        )}
                    </div>
                </div>

                <ul className="space-y-1.5" aria-label={t('reviewsPlus.title')}>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = distribution[star] || 0;
                        const pct = rated ? Math.round((count / rated) * 100) : 0;
                        return (
                            <li key={star} className="flex items-center gap-2.5 text-xs">
                                <span className="w-3 text-right text-[#a1a6b3] tabular-nums">{star}</span>
                                <span className="sr-only">{t('reviewsPlus.starLabel', { count: star })}</span>
                                <div className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-8 text-right text-[#6b7080] tabular-nums">{whole.format(count)}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {hasAspects(summary) && (
                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                    <p className="gh-eyebrow mb-3">{t('reviewsPlus.aspectsTitle')}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        {ASPECTS.filter(key => summary.aspects[key] != null).map(key => (
                            <li key={key} className="flex items-center gap-3 text-sm">
                                <span className="w-28 sm:w-32 shrink-0 truncate text-[#c9ccd4]">{t(`reviewsPlus.aspects.${key}`)}</span>
                                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${(summary.aspects[key] / 5) * 100}%` }} />
                                </div>
                                <span className="w-8 text-right text-xs font-semibold text-white tabular-nums">{one.format(summary.aspects[key])}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
