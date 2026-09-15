import React from 'react';
import { BsPeopleFill, BsStarFill } from 'react-icons/bs';
import HubImage from './HubImage.jsx';
import { formatCount } from './hubApi.js';
import { useT } from '../i18n/index.jsx';

const RATIOS = {
    landscape: 'aspect-[460/215]',
    portrait: 'aspect-[3/4]',
};

export const SOURCE_LABELS = {
    steam: 'Steam',
    gog: 'GOG',
    igdb: 'IGDB',
    twitch: 'Twitch',
    itad: 'IsThereAnyDeal',
    speedrun: 'Speedrun.com',
    retroachievements: 'RetroAchievements',
    opencritic: 'OpenCritic',
};

export function PriceTag({ item }) {
    if (!item.price) return null;
    return (
        <span className="flex items-center gap-1.5 min-w-0">
            {item.discount > 0 && (
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">-{item.discount}%</span>
            )}
            {item.originalPrice && <span className="hidden sm:inline text-[11px] text-[#6b7080] line-through truncate">{item.originalPrice}</span>}
            <span className="text-[13px] font-semibold text-[#eceef2]">{item.price}</span>
        </span>
    );
}

/** Card for a normalized hub item (Steam, GOG, IGDB, ...). */
export default function StoreCard({ item, onClick, variant = 'landscape', className = '' }) {
    const { t, locale } = useT();
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(item)}
            onKeyDown={e => { if (e.key === 'Enter') onClick?.(item); }}
            className={`game-card group ${className}`}
        >
            <div className={`relative ${RATIOS[variant] || RATIOS.landscape} overflow-hidden bg-[#171a22]`}>
                <HubImage src={item.image} alt={item.name} className="w-full h-full" />
                {item.rank && (
                    <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-white">#{item.rank}</span>
                )}
                {item.score ? (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        <BsStarFill className="text-amber-400 text-[9px]" /> {item.score}
                    </span>
                ) : null}
            </div>
            <div className="px-3 py-2.5">
                <h3 className="truncate text-sm font-semibold text-[#eceef2] group-hover:text-white">{item.name}</h3>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs text-[#6b7080] min-h-[20px]">
                    {item.players != null ? (
                        <span className="inline-flex items-center gap-1.5 text-[#a1a6b3]">
                            <BsPeopleFill className="text-[10px]" /> {formatCount(item.players, locale)} {t('hub.card.playing')}
                        </span>
                    ) : (
                        <span className={`truncate min-w-0 ${item.price ? 'hidden min-[480px]:inline' : ''}`}>{item.subtitle || item.tag || SOURCE_LABELS[item.source]}</span>
                    )}
                    <PriceTag item={item} />
                </div>
            </div>
        </div>
    );
}
