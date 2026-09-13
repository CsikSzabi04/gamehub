import React from 'react';
import { BsStopwatch, BsBoxArrowUpRight } from 'react-icons/bs';
import SectionHeader, { SectionLoader } from '../Components/SectionHeader.jsx';
import HubImage from './HubImage.jsx';
import { useHub, pickItems, timeAgo } from './hubApi.js';

/** Latest verified speedruns from speedrun.com */
export default function SpeedrunFeed() {
    const { data, error } = useHub('/speedrun/latest', pickItems);

    if (error) return null;
    if (!data) return <section className="mb-12"><SectionLoader title="Fresh speedruns" /></section>;
    if (!data.length) return null;

    return (
        <section className="w-full mb-12">
            <SectionHeader
                title="Fresh speedruns"
                subtitle="Runs verified in the last hours on speedrun.com"
                action={<a href="https://www.speedrun.com" target="_blank" rel="noopener noreferrer" className="gh-btn gh-btn-secondary !h-9 hidden sm:inline-flex">speedrun.com <BsBoxArrowUpRight className="w-3 h-3" /></a>}
            />
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {data.slice(0, 12).map(run => (
                    <li key={run.id}>
                        <a
                            href={run.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 pr-3 rounded-xl bg-[#111319] border border-white/[0.05] hover:border-white/[0.14] transition-colors"
                        >
                            <HubImage src={run.image} alt={run.name} className="w-12 aspect-[3/4] rounded-md shrink-0" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-[#eceef2] truncate">{run.name}</span>
                                <span className="block text-xs text-[#6b7080] truncate">{run.subtitle} · {run.player}</span>
                            </span>
                            <span className="text-right shrink-0">
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white tabular-nums">
                                    <BsStopwatch className="text-[#8b5cf6] text-xs" /> {run.tag}
                                </span>
                                <span className="block text-[11px] text-[#6b7080]">{timeAgo(run.date)}</span>
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
