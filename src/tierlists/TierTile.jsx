/* eslint-disable react/prop-types */
import HubImage from '../Hub/HubImage.jsx';
import { TIER_COLORS } from './tierUtils.js';

/** Square item tile used by the board and the editor. */
export default function TierTile({ item, selected, onClick, badge, title, draggable, onDragStart, onDragEnd }) {
    return (
        <button
            type="button"
            title={title || item.name}
            aria-label={title || item.name}
            aria-pressed={selected || undefined}
            onClick={onClick}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`group relative w-14 h-14 sm:w-[72px] sm:h-[72px] shrink-0 rounded-lg overflow-hidden bg-[#0e1016] border transition-all select-none touch-manipulation ${selected ? 'border-[#c4b5fd] ring-2 ring-[#8b5cf6] scale-[1.04] z-10' : 'border-white/[0.06] hover:border-white/20'} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
            <HubImage src={item.image} alt={item.name} fit="contain" width={160} className="w-full h-full p-0.5 pointer-events-none" />
            <span className="absolute inset-x-0 bottom-0 px-1 py-px bg-black/70 text-[9px] sm:text-[10px] leading-tight text-white truncate pointer-events-none">{item.name}</span>
            {badge != null && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-black/80 text-[10px] font-bold text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none">
                    {badge}
                </span>
            )}
        </button>
    );
}

export function TierLabel({ tier, className = '' }) {
    return (
        <span
            className={`w-12 sm:w-16 shrink-0 self-stretch flex items-center justify-center rounded-l-xl text-2xl sm:text-3xl font-black text-[#0a0b0f] ${className}`}
            style={{ backgroundColor: TIER_COLORS[tier] }}
        >
            {tier}
        </span>
    );
}
