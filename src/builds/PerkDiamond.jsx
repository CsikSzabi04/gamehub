/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { perkThumb } from './buildsApi.js';

const FRAMES = {
    survivor: 'from-[#4c1d95] via-[#2e1065] to-[#1e1b4b] border-[#a78bfa]/70',
    killer: 'from-[#7f1d1d] via-[#450a0a] to-[#1c0a0a] border-[#f87171]/70',
};

/** Dead by Daylight style perk icon: artwork on a rotated square frame. */
export default function PerkDiamond({ perk, role = 'survivor', size = 56, selected = false, empty = false, className = '' }) {
    const [attempt, setAttempt] = useState(0);
    useEffect(() => setAttempt(0), [perk?.image]);

    const sources = perk?.image ? [perkThumb(perk.image, size > 80 ? 160 : 96), perk.image] : [];
    const src = sources[attempt];

    return (
        <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
            <span
                className={`absolute inset-[15%] rotate-45 rounded-[3px] border-2 ${empty ? 'border-dashed border-white/20 bg-white/[0.03]' : `bg-gradient-to-br ${FRAMES[role] || FRAMES.survivor}`} ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111319]' : ''}`}
            />
            {!empty && (src ? (
                <img
                    src={src}
                    alt={perk.name}
                    loading="lazy"
                    decoding="async"
                    onError={() => setAttempt(a => a + 1)}
                    className="absolute inset-0 w-full h-full object-contain p-[6%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                />
            ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">{perk?.name?.[0] || '?'}</span>
            ))}
        </span>
    );
}
