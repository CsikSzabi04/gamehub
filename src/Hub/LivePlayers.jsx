import React, { useState } from 'react';
import { BsArrowUpShort, BsArrowDownShort, BsDash } from 'react-icons/bs';
import SectionHeader, { SectionLoader } from '../Components/SectionHeader.jsx';
import StoreCard from './StoreCard.jsx';
import HubImage from './HubImage.jsx';
import { useHub, formatCount, timeAgo } from './hubApi.js';
import useStoreItem from './useStoreItem.jsx';

function Trend({ rank, lastWeekRank }) {
    if (!lastWeekRank || lastWeekRank === rank) return <BsDash className="text-[#6b7080]" aria-label="Same rank as last week" />;
    return lastWeekRank > rank
        ? <BsArrowUpShort className="text-emerald-400 text-lg" aria-label={`Up from #${lastWeekRank}`} />
        : <BsArrowDownShort className="text-red-400 text-lg" aria-label={`Down from #${lastWeekRank}`} />;
}

/** Steam's most played games with live player counts. */
export default function LivePlayers() {
    const { data, error } = useHub('/steam/most-played');
    const [expanded, setExpanded] = useState(false);
    const [onItemClick, modal] = useStoreItem();

    if (error) return null;
    if (!data) return <section className="mb-12"><SectionLoader title="Most played right now" /></section>;

    const items = data.items || [];
    const podium = items.slice(0, 3);
    // On phones #1-#3 are compact rows too; the big cards only show from sm up
    const rows = items.slice(0, expanded ? 24 : 11);

    return (
        <section className="w-full mb-12">
            <SectionHeader
                title="Most played right now"
                subtitle={
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live player counts from Steam · updated {timeAgo(data.updatedAt)}
                    </span>
                }
            />

            <div className="hidden sm:grid grid-cols-3 gap-4 mb-4">
                {podium.map(item => <StoreCard key={item.id} item={item} onClick={onItemClick} />)}
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rows.map((item, index) => (
                    <li key={item.id} className={index < 3 ? 'sm:hidden' : undefined}>
                        <button
                            onClick={() => onItemClick(item)}
                            className="w-full flex items-center gap-3 p-2 pr-3 rounded-xl bg-[#111319] border border-white/[0.05] hover:border-white/[0.14] transition-colors text-left"
                        >
                            <span className="w-7 text-center text-sm font-bold text-[#6b7080] shrink-0">{item.rank}</span>
                            <HubImage src={item.image} alt={item.name} className="w-20 sm:w-24 aspect-[460/215] rounded-md shrink-0" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-[#eceef2] truncate">{item.name}</span>
                                <span className="block text-xs text-[#6b7080] truncate">Peak today {formatCount(item.peak)}</span>
                            </span>
                            <span className="text-right shrink-0">
                                <span className="block text-sm font-semibold text-white">{formatCount(item.players)}</span>
                                <span className="block text-[11px] text-[#6b7080]">playing</span>
                            </span>
                            <Trend rank={item.rank} lastWeekRank={item.lastWeekRank} />
                        </button>
                    </li>
                ))}
            </ol>

            {items.length > 11 && (
                <div className="mt-4 flex justify-center">
                    <button onClick={() => setExpanded(v => !v)} className="gh-btn gh-btn-secondary">
                        {expanded ? 'Show less' : `Show top ${items.length}`}
                    </button>
                </div>
            )}
            {modal}
        </section>
    );
}
