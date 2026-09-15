/* eslint-disable react/prop-types */
// Small presentational pieces shared by the LFG cards and modals.
import { Link } from 'react-router-dom';
import { BsController, BsMic, BsShieldCheck, BsClock, BsGlobe2, BsPeopleFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { ageKey, isExpired, isFull, languageName, millis, timeLeftLabel, whenLabel } from './constants.js';

export function Badge({ children, tone = 'default', icon: Icon }) {
    const tones = {
        default: 'bg-white/[0.06] text-[#c9ccd4]',
        accent: 'bg-[#8b5cf6]/15 text-[#c4b5fd]',
        green: 'bg-emerald-500/15 text-emerald-300',
        amber: 'bg-amber-500/15 text-amber-300',
        red: 'bg-red-500/15 text-red-300',
    };
    return (
        <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold whitespace-nowrap ${tones[tone] || tones.default}`}>
            {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
            {children}
        </span>
    );
}

export function GameCover({ post, cover, className = '' }) {
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#2a1f4d] via-[#171a22] to-[#0f1117] ${className}`}>
            {cover ? (
                <img src={cover} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <BsController className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 text-white/10" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-[#111319]/60 to-transparent" />
            <p className="absolute left-3 right-3 bottom-2 text-white font-bold text-base leading-tight line-clamp-1 drop-shadow">{post.gameName}</p>
        </div>
    );
}

/** Platform / mode / rank / language / region / mic / age pills. */
export function PostBadges({ post }) {
    const { t, locale } = useT();
    const language = languageName(post.language, locale);
    return (
        <div className="flex flex-wrap gap-1.5">
            <Badge tone="accent">{t(`lfg.platform.${post.platform}`)}</Badge>
            <Badge>{t(`lfg.mode.${post.mode}`)}</Badge>
            {post.rank && <Badge>{post.rank}</Badge>}
            {language && <Badge icon={BsGlobe2}>{language}</Badge>}
            {post.region && post.region !== 'any' && <Badge>{t(`lfg.region.${post.region}`)}</Badge>}
            {post.mic && <Badge icon={BsMic}>{t('lfg.badges.mic')}</Badge>}
            {post.ageGroup && post.ageGroup !== 'any' && <Badge tone="amber">{t(`lfg.age.${ageKey(post.ageGroup)}`)}</Badge>}
        </div>
    );
}

/** "2/5" with a thin progress bar. */
export function SlotsMeter({ post }) {
    const { t } = useT();
    const filled = post.filled || 0;
    const pct = post.slots ? Math.min(100, Math.round((filled / post.slots) * 100)) : 0;
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
                <BsPeopleFill className="w-3.5 h-3.5 text-[#8b5cf6]" aria-hidden="true" />
                <span className="font-semibold text-white">{t('lfg.card.slots', { filled, slots: post.slots })}</span>
            </div>
            <div className="mt-1.5 h-1 w-20 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/** Status line: when they play + countdown / closed / full / expired. */
export function PostTiming({ post, now }) {
    const { t, locale } = useT();
    const left = (millis(post.expiresAt) || 0) - now;
    let status;
    if (post.closed) status = <Badge tone="red">{t('lfg.status.closed')}</Badge>;
    else if (isExpired(post, now)) status = <Badge tone="red">{t('lfg.time.expired')}</Badge>;
    else if (isFull(post)) status = <Badge tone="green">{t('lfg.status.full')}</Badge>;
    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#a1a6b3]">
            <span className="inline-flex items-center gap-1">
                <BsController className="w-3.5 h-3.5" aria-hidden="true" />
                {whenLabel(post.when, t, locale)}
            </span>
            {!post.closed && left > 0 && (
                <span className="inline-flex items-center gap-1" title={t('lfg.card.expiresIn')}>
                    <BsClock className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('lfg.card.timeLeft', { time: timeLeftLabel(left, t) })}
                </span>
            )}
            {status}
        </div>
    );
}

export function UserLink({ username, className = '' }) {
    if (!username) return null;
    return (
        <Link
            to={`/u/${encodeURIComponent(username)}`}
            onClick={e => e.stopPropagation()}
            className={`font-semibold text-[#c4b5fd] hover:text-white truncate ${className}`}
        >
            {username}
        </Link>
    );
}

export function SafetyNote({ className = '' }) {
    const { t } = useT();
    return (
        <p className={`flex gap-2 text-xs text-[#a1a6b3] rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 ${className}`}>
            <BsShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-px" aria-hidden="true" />
            <span>{t('lfg.safety.text')}</span>
        </p>
    );
}

export function FormError({ children }) {
    if (!children) return null;
    return <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">{children}</p>;
}

export function CardSkeleton() {
    return (
        <div className="gh-surface overflow-hidden animate-pulse" aria-hidden="true">
            <div className="h-24 bg-white/[0.04]" />
            <div className="p-4 space-y-3">
                <div className="flex gap-1.5">
                    <div className="h-6 w-16 rounded-md bg-white/[0.06]" />
                    <div className="h-6 w-14 rounded-md bg-white/[0.06]" />
                    <div className="h-6 w-12 rounded-md bg-white/[0.06]" />
                </div>
                <div className="h-3 w-4/5 rounded bg-white/[0.05]" />
                <div className="h-3 w-3/5 rounded bg-white/[0.05]" />
                <div className="h-9 w-full rounded-lg bg-white/[0.05]" />
            </div>
        </div>
    );
}
