import React from 'react';
import { BsBoxArrowUpRight, BsPeopleFill } from 'react-icons/bs';
import { useHub, useHubProviders, formatCount } from './hubApi.js';
import HubImage from './HubImage.jsx';
import { optimizedSrc } from '../Components/imageMirror.js';

/**
 * Live Steam data (price, players now, reviews, news) and SteamGridDB artwork
 * attached to a game known only by its name, e.g. a RAWG game.
 */
export default function SteamInsights({ name }) {
    const query = name ? `?name=${encodeURIComponent(name)}` : null;
    const { data, error } = useHub(query && `/steam/lookup${query}`);
    const providers = useHubProviders();
    const { data: art } = useHub(query && providers?.steamgriddb ? `/artwork${query}` : null);

    if (!name || error) return null;

    if (!data) {
        return <div className="mt-6 h-[88px] rounded-xl bg-[#171a22] animate-pulse" aria-label="Loading Steam data" />;
    }
    if (!data.found) return null;

    const price = data.isFree ? 'Free to play' : data.price?.final;

    return (
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0e1016] overflow-hidden">
            {art?.found && art.hero && (
                <div className="relative">
                    <HubImage src={art.hero} alt={`${data.name} artwork`} width={1280} className="w-full aspect-[96/31]" />
                    {art.logo && <img src={optimizedSrc(art.logo, 480)} onError={e => { if (e.currentTarget.src !== art.logo) e.currentTarget.src = art.logo; }} alt="" loading="lazy" decoding="async"className="absolute left-4 bottom-3 max-h-[45%] max-w-[45%] object-contain" />}
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="gh-eyebrow">Live on Steam</p>
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c4b5fd] hover:text-white">
                        Store page <BsBoxArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-[#6b7080]">Price</p>
                        <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                            {data.price?.discount > 0 && <span className="rounded bg-emerald-500/15 px-1.5 text-[11px] font-bold text-emerald-400">-{data.price.discount}%</span>}
                            {price || '–'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#6b7080]">Playing now</p>
                        <p className="text-sm font-semibold text-white mt-0.5 inline-flex items-center gap-1.5">
                            <BsPeopleFill className="text-[10px] text-emerald-400" /> {formatCount(data.players)}
                        </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-[#6b7080]">Steam reviews</p>
                        <p className="text-sm font-semibold text-white mt-0.5 truncate">
                            {data.reviews ? `${data.reviews.percent}% · ${data.reviews.label}` : '–'}
                        </p>
                    </div>
                </div>
                {data.news?.[0] && (
                    <a href={data.news[0].url} target="_blank" rel="noopener noreferrer" className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 text-sm text-[#a1a6b3] hover:text-white">
                        <span className="truncate">News: {data.news[0].title}</span>
                        <span className="text-xs text-[#6b7080] shrink-0">{new Date(data.news[0].date).toLocaleDateString()}</span>
                    </a>
                )}
            </div>
        </div>
    );
}
