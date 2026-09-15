/* eslint-disable react/prop-types */
import { useId } from 'react';

const W = 240;
const H = 56;
const PAD = 3;

/**
 * Step-line price chart without a chart library.
 * @param {{ points: { t: number, price: number }[], current?: number, label: string, startLabel?: string, endLabel?: string, formatValue?: (n: number) => string }} props
 */
export default function Sparkline({ points, current, label, startLabel, endLabel, formatValue }) {
    const gradientId = useId().replace(/:/g, '');
    const series = (points || []).filter(p => Number.isFinite(p.t) && typeof p.price === 'number');
    const now = Date.now();
    if (typeof current === 'number') series.push({ t: now, price: current });
    if (series.length < 2) return null;

    const start = Math.min(series[0].t, now - 365 * 24 * 3600 * 1000);
    const end = Math.max(series[series.length - 1].t, now);
    const prices = series.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const x = t => ((t - start) / (end - start || 1)) * W;
    const y = price => (max === min ? H / 2 : PAD + (1 - (price - min) / range) * (H - PAD * 2));

    // step line: the price holds until the next change
    let d = `M0 ${y(series[0].price).toFixed(1)}`;
    for (let i = 0; i < series.length; i++) {
        const px = x(series[i].t).toFixed(1);
        if (i > 0) d += ` H${px}`;
        d += ` V${y(series[i].price).toFixed(1)}`;
    }
    d += ` H${W}`;
    const area = `${d} V${H} H0 Z`;
    const lowX = x(series[prices.indexOf(min)].t);

    return (
        <figure className="m-0">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-14 block" role="img" aria-label={label}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill={`url(#${gradientId})`} />
                <path d={d} fill="none" stroke="#a78bfa" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                <line x1={lowX} x2={lowX} y1={y(min)} y2={H} stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
            </svg>
            <figcaption className="flex justify-between gap-2 text-[10px] text-[#6b7080] mt-1 tabular-nums">
                <span>{startLabel}</span>
                {formatValue && <span className="truncate">{formatValue(min)} – {formatValue(max)}</span>}
                <span>{endLabel}</span>
            </figcaption>
        </figure>
    );
}
