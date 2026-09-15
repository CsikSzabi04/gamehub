/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { BsClipboard, BsHeart, BsHeartFill, BsShare } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import PerkDiamond from './PerkDiamond.jsx';

export function LikeButton({ liked, count, onClick, busy, className = '' }) {
    const { t, locale } = useT();
    return (
        <button
            type="button"
            onClick={e => {
                e.stopPropagation();
                onClick();
            }}
            disabled={busy}
            aria-pressed={liked}
            aria-label={t(liked ? 'builds.unlike' : 'builds.like')}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold transition-colors ${liked ? 'bg-[#f43f5e]/15 text-[#fb7185]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'} ${className}`}
        >
            {liked ? <BsHeartFill className="w-4 h-4" /> : <BsHeart className="w-4 h-4" />}
            {new Intl.NumberFormat(locale).format(Math.max(0, count || 0))}
        </button>
    );
}

export function AuthorLink({ build, className = '' }) {
    const { t } = useT();
    if (!build.username) return <span className={className}>{t('builds.anonymous')}</span>;
    return (
        <Link to={`/u/${encodeURIComponent(build.username)}`} onClick={e => e.stopPropagation()} className={`hover:text-white ${className}`}>
            @{build.username}
        </Link>
    );
}

export default function BuildCard({ build, liked, likeBusy, onLike, onOpen, onShare, onCopy }) {
    const { t } = useT();
    const stop = fn => e => {
        e.stopPropagation();
        fn();
    };

    return (
        <article
            onClick={onOpen}
            className="gh-surface p-4 flex flex-col gap-3 cursor-pointer hover:border-white/[0.12] transition-colors"
        >
            <div className="flex items-center justify-between gap-2">
                <span className={`gh-chip !text-[11px] ${build.role === 'killer' ? '!text-[#fca5a5]' : '!text-[#c4b5fd]'}`}>
                    {t(`builds.role.${build.role}`)}{build.character ? ` · ${build.character}` : ''}
                </span>
            </div>

            <div className="flex justify-between sm:justify-start sm:gap-2 px-1">
                {(build.perks || []).slice(0, 4).map(perk => (
                    <PerkDiamond key={perk.name} perk={perk} role={build.role} size={64} />
                ))}
            </div>

            <div className="min-w-0">
                <h3 className="font-bold text-white leading-snug line-clamp-2">
                    <button type="button" onClick={stop(onOpen)} className="text-left hover:text-[#c4b5fd]">{build.title}</button>
                </h3>
                <p className="text-xs text-[#6b7080] mt-1 truncate">{(build.perks || []).map(p => p.name).join(' · ')}</p>
                <p className="text-xs text-[#a1a6b3] mt-1.5">{t('builds.by')} <AuthorLink build={build} /></p>
            </div>

            {build.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {build.tags.map(tag => <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-[#a1a6b3]">#{t(`builds.tags.${tag}`)}</span>)}
                </div>
            )}

            <div className="flex items-center gap-1.5 mt-auto pt-1">
                <LikeButton liked={liked} count={build.likeCount} busy={likeBusy} onClick={onLike} />
                <button type="button" onClick={stop(onShare)} aria-label={t('builds.shareLink')} title={t('builds.shareLink')} className="gh-icon-btn !w-9 !h-9">
                    <BsShare className="w-4 h-4" />
                </button>
                <button type="button" onClick={stop(onCopy)} aria-label={t('builds.copyText')} title={t('builds.copyText')} className="gh-icon-btn !w-9 !h-9">
                    <BsClipboard className="w-4 h-4" />
                </button>
            </div>
        </article>
    );
}
