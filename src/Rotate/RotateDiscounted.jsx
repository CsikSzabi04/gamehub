import React, { useState, useEffect } from "react";
import SectionHeader from "../Components/SectionHeader.jsx";
import { useT } from "../i18n/index.jsx";

// Card width as a percentage of the track from md (md:w-1/4 lg:w-1/5); below md the row is a swipe scroller
function getCardPercent() {
    if (window.innerWidth >= 1024) return 20;
    if (window.innerWidth >= 768) return 25;
    if (window.innerWidth >= 640) return 50;
    return 70;
}

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const { t } = useT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardPercent, setCardPercent] = useState(getCardPercent);

    useEffect(() => {
        const handleResize = () => setCardPercent(getCardPercent());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, games.length - Math.floor(100 / cardPercent));

    useEffect(() => {
        if (!games.length) return;
        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
        }, 15000);
        return () => clearInterval(rotateInterval);
    }, [games, maxIndex]);

    function nextItem() {
        setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }

    function prevItem() {
        setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    }

    if (!games || games.length === 0) {
        return null;
    }

    return (
        <div>
            <SectionHeader title={name} subtitle={t('rotate.discountedSubtitle')} onPrev={prevItem} onNext={nextItem} />

            <div className="gh-scroller overflow-hidden -mx-2">
                <div
                    className="gh-track flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${Math.min(currentIndex, maxIndex) * cardPercent}%)` }}
                >
                    {games.map((game, index) => {
                        const original = game.originalPrice * 1.3;
                        const price = Number(game.discountPrice || 0);
                        const percent = original > 0 ? Math.round((1 - price / original) * 100) : 0;
                        return (
                            <div key={`${game.id}-${index}`} className="flex-none w-[42%] sm:w-[30%] md:w-1/4 lg:w-1/5 px-2">
                                <div className="game-card group h-full flex flex-col" onClick={() => showGameDetails(game)}>
                                    <div className="aspect-[3/4] overflow-hidden bg-[#171a22]">
                                        {game.background_image && (
                                            <img
                                                loading="lazy"
                                                decoding="async"
                                                src={game.background_image}
                                                alt={game.name}
                                                width="270"
                                                height="360"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="p-3 sm:p-3.5 flex flex-col flex-1">
                                        <h3 className="text-[13px] sm:text-sm font-semibold text-white line-clamp-2 leading-snug">{game.name}</h3>
                                        <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            {percent > 0 && (
                                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-bold text-emerald-400">-{percent}%</span>
                                            )}
                                            <span className="text-xs text-[#6b7080] line-through">${original.toFixed(2)}</span>
                                            <span className="ml-auto text-sm font-semibold text-white">${price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
