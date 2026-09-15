/* eslint-disable react/prop-types */
// Cards for the recommender: a picked game, a backlog suggestion and the taste profile.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsCheck2, BsCheck2Circle, BsController, BsEyeSlash, BsHeart, BsHeartFill, BsHourglassSplit, BsLightningCharge, BsPeople, BsPlayCircle, BsStarFill, BsStars, BsTrophy,
} from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { formatHours, reasonText } from './recoText.js';

export function MatchPill({ match, className = '' }) {
    const { t } = useT();
    const tone = match >= 80 ? 'bg-emerald-400 text-[#0a0b0f]' : match >= 60 ? 'bg-[#c4b5fd] text-[#0a0b0f]' : 'bg-white/[0.12] text-white';
    return (
        <span className={`inline-flex items-center h-6 px-2 rounded-md text-xs font-extrabold tabular-nums ${tone} ${className}`}>
            {t('forYou.match', { percent: match })}
        </span>
    );
}

function PriceLine({ card }) {
    const { t } = useT();
    const price = card.price;
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            {price?.discount > 0 && <span className="inline-flex items-center h-6 px-1.5 rounded bg-emerald-500 text-[#0a0b0f] text-xs font-extrabold">-{price.discount}%</span>}
            {price?.discount > 0 && price.formattedOriginal && <span className="text-xs text-[#6b7080] line-through tabular-nums">{price.formattedOriginal}</span>}
            {price?.formatted ? <span className="text-sm font-bold text-white tabular-nums">{price.formatted}</span> : card.isFree && <span className="text-sm font-bold text-white">{t('forYou.card.free')}</span>}
        </div>
    );
}

export function RecoCard({ card, tagNames, onWishlist, onHide }) {
    const { t, locale } = useT();
    const [busy, setBusy] = useState(null);
    const [added, setAdded] = useState(false);
    const href = `/game/steam/${card.appid}`;
    const reason = reasonText(t, locale, card.because, card.sharedTags, tagNames);
    const tags = card.sharedTags.map(tag => tagNames[tag]).filter(Boolean);
    const wished = card.onWishlist || added;

    const run = (kind, action) => async () => {
        if (busy) return;
        setBusy(kind);
        try {
            await action(card);
            if (kind === 'wishlist') setAdded(true);
        } catch (error) {
            console.error('Recommendation action failed:', error);
        } finally {
            setBusy(null);
        }
    };

    return (
        <li className="gh-surface overflow-hidden flex flex-col min-w-0">
            <Link to={href} className="relative block aspect-[460/215] bg-[#171a22] overflow-hidden" aria-label={t('forYou.card.openGame')}>
                <img src={card.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
                <MatchPill match={card.match} className="absolute left-2 top-2 shadow" />
            </Link>
            <div className="flex-1 p-3 flex flex-col gap-2 min-w-0">
                <Link to={href} className="font-semibold text-white leading-snug line-clamp-2 hover:text-[#c4b5fd]">{card.name}</Link>
                {reason && (
                    <p className="flex items-start gap-1.5 text-[13px] leading-snug text-[#d4d6dd]">
                        <BsStars className="mt-0.5 shrink-0 text-[#c4b5fd]" aria-hidden="true" />
                        <span className="line-clamp-2">{reason}</span>
                    </p>
                )}
                {card.because && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map(tag => <span key={tag} className="h-5 px-1.5 rounded bg-white/[0.06] text-[11px] leading-5 text-[#a1a6b3]">{tag}</span>)}
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8a8f9c]">
                    {card.reviewPct != null && card.reviewCount >= 30 && <span>{t('forYou.card.reviews', { percent: card.reviewPct })}</span>}
                    {card.earlyAccess && <span className="text-[#fbbf24]">{t('forYou.card.earlyAccess')}</span>}
                    {wished && <span className="inline-flex items-center gap-1 text-[#f9a8d4]"><BsHeartFill aria-hidden="true" /> {t('forYou.card.onWishlist')}</span>}
                </div>
                <div className="mt-auto pt-1 flex items-center gap-2 min-w-0">
                    <div className="min-w-0 flex-1"><PriceLine card={card} /></div>
                    {!wished && (
                        <button type="button" onClick={run('wishlist', onWishlist)} disabled={Boolean(busy)} title={t('forYou.card.addWishlist')} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold border border-white/[0.08] bg-white/[0.04] text-[#c9ccd4] hover:bg-white/[0.08] disabled:opacity-60">
                            {added ? <BsCheck2 aria-hidden="true" /> : <BsHeart aria-hidden="true" />}
                            <span className="hidden sm:inline">{added ? t('forYou.card.added') : t('forYou.card.addWishlist')}</span>
                        </button>
                    )}
                    <button type="button" onClick={run('hide', onHide)} disabled={Boolean(busy)} title={t('forYou.card.hide')} aria-label={t('forYou.card.hide')} className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#8a8f9c] hover:text-white hover:bg-white/[0.08] disabled:opacity-60">
                        <BsEyeSlash aria-hidden="true" />
                    </button>
                </div>
            </div>
        </li>
    );
}

export function BacklogCard({ card, tagNames, rank }) {
    const { t, locale } = useT();
    const href = `/game/steam/${card.appid}`;
    const reason = reasonText(t, locale, card.because, card.sharedTags, tagNames);
    const facts = [
        card.short &&{ icon: BsLightningCharge, text: t('forYou.backlog.short'), tone: 'text-[#fde68a]' },
        card.started && { icon: BsPlayCircle, text: t('forYou.backlog.started', { hours: formatHours(card.hours, locale) }), tone: 'text-[#93c5fd]' },
    ].filter(Boolean);

    return (
        <li className={`gh-surface overflow-hidden flex ${rank === 0 ? 'flex-col sm:flex-row' : 'flex-row'} min-w-0`}>
            <Link to={href} className={`${rank === 0 ? 'sm:w-64 aspect-[460/215] sm:aspect-auto' : 'w-28 sm:w-36'} shrink-0 bg-[#171a22] overflow-hidden`}>
                <img src={card.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1 p-3 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2 min-w-0">
                    <Link to={href} className={`font-semibold text-white leading-snug line-clamp-2 hover:text-[#c4b5fd] ${rank === 0 ? 'text-base sm:text-lg' : 'text-sm'}`}>{card.name}</Link>
                    <MatchPill match={card.match} className="shrink-0" />
                </div>
                {facts.map(fact => (
                    <p key={fact.text} className={`flex items-center gap-1.5 text-[13px] font-semibold ${fact.tone}`}>
                        <fact.icon className="shrink-0" aria-hidden="true" /> {fact.text}
                    </p>
                ))}
                {reason && (
                    <p className="flex items-start gap-1.5 text-[13px] leading-snug text-[#a1a6b3]">
                        <BsStars className="mt-0.5 shrink-0 text-[#c4b5fd]" aria-hidden="true" />
                        <span className="line-clamp-2">{reason}</span>
                    </p>
                )}
            </div>
        </li>
    );
}

const DIFFICULTY_PERCENT = { challenge: 'hardShare', relaxed: 'easyShare' };

export function TasteCard({ taste, tagNames }) {
    const { t, locale } = useT();
    const tags = taste.topTags.filter(tag => tagNames[tag.tag]).slice(0, 8);
    const percent = value => Math.round((value || 0) * 100);
    const facts = [
        {
            icon: BsTrophy,
            title: t('forYou.taste.difficultyTitle'),
            value: t(`forYou.taste.difficulty.${taste.difficulty}`),
            hint: t(`forYou.taste.difficultyHint.${taste.difficulty}`, { percent: percent(taste[DIFFICULTY_PERCENT[taste.difficulty]]) }),
        },
        {
            icon: taste.playStyle === 'singleplayer' ? BsController : BsPeople,
            title: t('forYou.taste.playStyleTitle'),
            value: t(`forYou.taste.playStyle.${taste.playStyle}`),
            hint: t('forYou.taste.playStyleHint', { percent: percent(taste.multiShare) }),
        },
        {
            icon: BsHourglassSplit,
            title: t('forYou.taste.lengthTitle'),
            value: taste.typicalLength ? t('forYou.taste.hoursShort', { hours: formatHours(taste.typicalLength, locale) }) : '–',
            hint: taste.typicalLength ? t('forYou.taste.length', { hours: formatHours(taste.typicalLength, locale) }) : t('forYou.taste.lengthUnknown'),
        },
    ];

    return (
        <section className="gh-surface p-4 sm:p-5 space-y-5" aria-labelledby="taste-title">
            <div>
                <h2 id="taste-title" className="flex items-center gap-2 text-lg font-bold text-white"><BsStars className="text-[#c4b5fd]" aria-hidden="true" /> {t('forYou.taste.title')}</h2>
                <p className="text-xs text-[#8a8f9c] mt-0.5">{t('forYou.taste.basedOn', { count: taste.signalCount })}</p>
            </div>

            {tags.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('forYou.taste.topTags')}</p>
                    <ul className="space-y-1.5">
                        {tags.map(tag => (
                            <li key={tag.tag} className="flex items-center gap-2 text-sm">
                                <span className="w-32 shrink-0 truncate text-[#d4d6dd]">{tagNames[tag.tag]}</span>
                                <span className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                                    <span className="block h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd]" style={{ width: `${Math.max(8, tag.strength * 100)}%` }} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <dl className="grid gap-2">
                {facts.map(fact => (
                    <div key={fact.title} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8a8f9c]"><fact.icon aria-hidden="true" /> {fact.title}</dt>
                        <dd className="text-sm font-semibold text-white mt-0.5">{fact.value}</dd>
                        <dd className="text-xs text-[#8a8f9c] mt-0.5">{fact.hint}</dd>
                    </div>
                ))}
            </dl>

            {taste.liked.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('forYou.taste.influences')}</p>
                    <ul className="space-y-2">
                        {taste.liked.slice(0, 5).map(signal => (
                            <li key={signal.appid} className="flex items-center gap-2.5 min-w-0">
                                <img src={signal.app.image} alt="" loading="lazy" className="h-9 w-[77px] shrink-0 rounded object-cover bg-[#171a22]" />
                                <div className="min-w-0">
                                    <p className="text-sm text-white truncate">{signal.name || signal.app.name}</p>
                                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-[#8a8f9c]">
                                        {signal.hours >= 1 && <span>{t('forYou.taste.hoursShort', { hours: formatHours(signal.hours, locale) })}</span>}
                                        {signal.rating && <span className="inline-flex items-center gap-0.5 text-[#fbbf24]"><BsStarFill className="h-3 w-3" aria-hidden="true" />{signal.rating}</span>}
                                        {signal.status === 'completed' && <BsCheck2Circle className="text-[#34d399]" aria-hidden="true" />}
                                        {signal.achievement?.total > 0 && signal.achievement.unlocked >= signal.achievement.total && <BsTrophy className="text-[#fbbf24]" aria-hidden="true" />}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
