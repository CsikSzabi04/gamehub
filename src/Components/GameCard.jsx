import React from 'react';
import { Link } from 'react-router-dom';
import { BsStarFill, BsChatSquareText } from 'react-icons/bs';
import { rawgImg, rawgSrcSet } from './rawgImage.js';

export function releaseYear(released) {
    if (!released) return 'TBA';
    const year = new Date(released).getFullYear();
    return isNaN(year) ? released : year;
}

export default function GameCard({ game, onClick, className = '' }) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(game)}
            onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(game); }}
            className={`game-card group ${className}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#171a22]">
                {game.background_image && (
                    <img
                        loading="lazy"
                        decoding="async"
                        src={rawgImg(game.background_image, 640)}
                        srcSet={rawgSrcSet(game.background_image)}
                        sizes="(min-width: 768px) 300px, (min-width: 640px) 260px, 50vw"
                        alt={game.name}
                        width="600"
                        height="375"
                        className="w-full h-full object-cover"
                    />
                )}

                {game.rating ? (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        <BsStarFill className="text-amber-400 text-[9px]" />
                        {Number(game.rating).toFixed(1)}
                    </span>
                ) : null}

                <Link
                    to={`/allreview/${game.id}`}
                    onClick={(e) => e.stopPropagation()}
                    title="Open game page"
                    className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-[11px] font-medium text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus:opacity-100 transition-all duration-200 hover:bg-black"
                >
                    <BsChatSquareText className="text-[10px]" />
                    Reviews
                </Link>
            </div>

            <div className="px-3.5 py-3">
                <h3 className="truncate text-[15px] font-semibold text-[#eceef2] group-hover:text-white">{game.name}</h3>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#6b7080]">
                    <span>{releaseYear(game.released)}</span>
                    {game.genres?.[0] && <span className="truncate">{game.genres[0].name}</span>}
                </div>
            </div>
        </div>
    );
}
