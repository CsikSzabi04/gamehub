/* eslint-disable react/prop-types */
import { BsPersonPlus, BsGear, BsCheckCircle, BsHourglassSplit, BsXCircle } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { isOpen } from './constants.js';
import { Badge, GameCover, PostBadges, PostTiming, SlotsMeter, UserLink } from './parts.jsx';

const STATUS_ICONS = { pending: BsHourglassSplit, accepted: BsCheckCircle, declined: BsXCircle };

export default function LfgCard({ post, cover, now, isOwner, myRequest, pendingCount = 0, highlighted, onOpen, onJoin }) {
    const { t } = useT();
    const open = isOpen(post, now);

    let action;
    if (isOwner) {
        action = (
            <button type="button" onClick={e => { e.stopPropagation(); onOpen(post); }} className="gh-btn gh-btn-secondary !h-9 w-full sm:w-auto">
                <BsGear aria-hidden="true" />
                {t('lfg.card.manage')}
                {pendingCount > 0 && <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-[#8b5cf6] text-white text-[11px] font-bold inline-flex items-center justify-center">{pendingCount}</span>}
            </button>
        );
    } else if (myRequest) {
        const Icon = STATUS_ICONS[myRequest.status] || BsHourglassSplit;
        action = (
            <button type="button" onClick={e => { e.stopPropagation(); onOpen(post); }} className="gh-btn gh-btn-secondary !h-9 w-full sm:w-auto">
                <Icon aria-hidden="true" />
                {t(`lfg.request.status.${myRequest.status}`)}
            </button>
        );
    } else if (open) {
        action = (
            <button type="button" onClick={e => { e.stopPropagation(); onJoin(post); }} className="gh-btn gh-btn-primary !h-9 w-full sm:w-auto">
                <BsPersonPlus aria-hidden="true" />
                {t('lfg.card.join')}
            </button>
        );
    } else {
        action = (
            <button type="button" onClick={e => { e.stopPropagation(); onOpen(post); }} className="gh-btn gh-btn-secondary !h-9 w-full sm:w-auto">
                {t('lfg.card.view')}
            </button>
        );
    }

    return (
        <article
            id={`lfg-${post.id}`}
            onClick={() => onOpen(post)}
            onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onOpen(post); }}
            tabIndex={0}
            aria-label={post.gameName}
            className={`gh-surface overflow-hidden flex flex-col cursor-pointer transition-[box-shadow,transform] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] ${highlighted ? 'ring-2 ring-[#8b5cf6] shadow-[0_0_0_6px_rgba(139,92,246,0.15)]' : ''} ${open || isOwner ? '' : 'opacity-75'}`}
        >
            <GameCover post={post} cover={cover} className="h-24" />
            <div className="p-4 pt-3 flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between gap-2 text-xs text-[#6b7080]">
                    <span className="min-w-0 truncate">
                        {t('lfg.card.by')} <UserLink username={post.username} />
                    </span>
                    {isOwner && <Badge tone="accent">{t('lfg.card.yours')}</Badge>}
                </div>
                <PostBadges post={post} />
                <PostTiming post={post} now={now} />
                {post.note && <p className="text-sm text-[#c9ccd4] line-clamp-3 break-words">{post.note}</p>}
                <div className="mt-auto pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <SlotsMeter post={post} />
                    {action}
                </div>
            </div>
        </article>
    );
}
