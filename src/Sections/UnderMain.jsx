import { useState, useEffect } from "react";
import { BsStarFill } from "react-icons/bs";
import { releaseYear } from "../Components/GameCard.jsx";
import { rawgImg } from "../Components/rawgImage.js";
import { useT } from "../i18n/index.jsx";

function Tile({ game, onClick, large }) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(game)}
            onKeyDown={(e) => { if (e.key === 'Enter') onClick(game); }}
            className={`group relative overflow-hidden rounded-xl bg-[#111319] cursor-pointer ${large ? 'min-h-[260px] md:min-h-0' : 'min-h-[140px]'}`}
        >
            <img
                loading="lazy"
                decoding="async"
                src={rawgImg(game.background_image, large ? 1280 : 640)}
                alt={game.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className={`absolute inset-x-0 bottom-0 ${large ? 'p-5 md:p-6' : 'p-3.5'}`}>
                <h3 className={`font-semibold text-white truncate ${large ? 'text-xl md:text-2xl' : 'text-sm'}`}>{game.name}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#c9ccd4]">
                    <span>{releaseYear(game.released)}</span>
                    <span className="inline-flex items-center gap-1">
                        <BsStarFill className="text-amber-400 text-[10px]" />
                        {Number(game.rating ?? 0).toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function MainSection({ allGames, showGameDetails }) {
    const { t } = useT();
    const [randomGames, setRandomGames] = useState([]);

    useEffect(() => {
        setRandomGames([...allGames].sort(() => Math.random() - 0.5).slice(0, 4));
    }, [allGames]);

    return (
        <div className="mb-12">
            <h2 className="gh-section-title !mb-4">{t('home.moreToExplore')}</h2>
            {randomGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-3 md:h-[440px]">
                    <div className="md:col-span-2 md:row-span-3 grid">
                        <Tile game={randomGames[0]} onClick={showGameDetails} large />
                    </div>
                    {randomGames.slice(1).map((game) => (
                        <Tile key={game.id} game={game} onClick={showGameDetails} />
                    ))}
                </div>
            ) : (
                <div className="h-[440px] rounded-xl bg-[#111319] animate-pulse" />
            )}
        </div>
    );
}
