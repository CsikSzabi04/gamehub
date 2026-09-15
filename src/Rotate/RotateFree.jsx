import React, { useState, useEffect } from "react";
import { BsBoxArrowUpRight } from "react-icons/bs";
import SectionHeader from "../Components/SectionHeader.jsx";
import { useT } from "../i18n/index.jsx";

// Card width as a percentage of the track, matching w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4
function getCardPercent() {
    if (window.innerWidth >= 1024) return 25;
    if (window.innerWidth >= 768) return 100 / 3;
    if (window.innerWidth >= 640) return 50;
    return 80;
}

export default function RotateFree({ games, showGameDetails, name }) {
    const { t } = useT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardPercent, setCardPercent] = useState(getCardPercent);

    useEffect(() => {
        const handleResize = () => setCardPercent(getCardPercent());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Stop before the last full page so the track never scrolls into empty space
    const maxIndex = Math.max(0, games.length - Math.floor(100 / cardPercent));

    useEffect(() => {
        if (!games.length) return;
        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
        }, 20000);
        return () => clearInterval(rotateInterval);
    }, [games, maxIndex]);

    const nextItem = () => {
        if (!games.length) return;
        setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    };

    const prevItem = () => {
        if (!games.length) return;
        setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    };

    return (
        <div className="relative">
            <SectionHeader title={name} subtitle={t('rotate.freeSubtitle')} onPrev={prevItem} onNext={nextItem} />
            <div className="gh-scroller relative overflow-hidden -mx-2">
                <div
                    className="gh-track flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${Math.min(currentIndex, maxIndex) * cardPercent}%)` }}
                >
                    {games.map((game) => (
                        <div key={game.id} className="flex-none w-[78%] sm:w-[46%] md:w-1/3 lg:w-1/4 px-2">
                            <div
                                className="game-card group h-full flex flex-col"
                                onClick={() => showGameDetails(game)}
                            >
                                <div className="aspect-[16/9] overflow-hidden bg-[#171a22]">
                                    <img loading="lazy" decoding="async" src={game.thumbnail} alt={game.title} width="365" height="206" className="h-full w-full object-cover" />
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {game.genre && <span className="gh-chip !py-0.5 !text-[11px]">{game.genre}</span>}
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">{t('common.free')}</span>
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-white line-clamp-1">{game.title}</h3>
                                    <p className="text-sm text-[#8a8f9c] mt-1.5 line-clamp-2">{game.short_description}</p>
                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#6b7080]">
                                        <span className="truncate">{game.platform}</span>
                                        <span className="inline-flex items-center gap-1 text-[#c9ccd4] group-hover:text-white">
                                            {t('rotate.play')} <BsBoxArrowUpRight className="text-[10px]" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
