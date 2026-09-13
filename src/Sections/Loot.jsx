import React, { useState, useEffect, useRef } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import SectionHeader, { SectionLoader } from "../Components/SectionHeader.jsx";
import { API_BASE, useApi } from "../Components/apiCache.js";

function toGiveaways(data) {
    if (!Array.isArray(data)) return [];
    return data.map((giveaway) => ({
        id: giveaway.id,
        title: giveaway.title,
        description: giveaway.description,
        thumbnail: giveaway.thumbnail,
        platforms: giveaway.platforms,
        instructions: giveaway.instructions,
        openGiveawayUrl: giveaway.open_giveaway_url,
        gamerPowerUrl: giveaway.gamerpower_url,
        publishedDate: giveaway.published_date,
        status: giveaway.status,
    }));
}

export default function Giveaways() {
    const { data: giveaways, loading } = useApi(`${API_BASE}/loot`, toGiveaways);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    // Cards per view from md (w-1/4, lg:w-1/5); below md the row is a native swipe scroller
    const cardsToShow = typeof window !== "undefined" && window.innerWidth >= 1024 ? 5 : 4;

    useEffect(() => {
        if (!giveaways?.length) return;
        const interval = setInterval(() => {
            if (!isAnimating) {
                setCurrentIndex(prev => (prev + 1) % Math.max(1, giveaways.length - cardsToShow + 1));
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [giveaways?.length, isAnimating]);

    function showGiveawayDetails(giveaway) {
        window.open(giveaway.openGiveawayUrl, "_blank");
    }

    function nextItem() {
        if (isAnimating || !giveaways) return;
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % Math.max(1, giveaways.length - cardsToShow + 1));
        setTimeout(() => setIsAnimating(false), 500);
    }

    function prevItem() {
        if (isAnimating || !giveaways) return;
        setIsAnimating(true);
        const positions = Math.max(1, giveaways.length - cardsToShow + 1);
        setCurrentIndex(prev => (prev - 1 + positions) % positions);
        setTimeout(() => setIsAnimating(false), 500);
    }

    return (
        <div className="w-full mb-12">
            {loading || !giveaways ? (
                <SectionLoader title="Loot giveaways" height="h-[230px]" />
            ) : giveaways.length === 0 ? (
                <>
                    <h2 className="gh-section-title !mb-4">Loot giveaways</h2>
                    <div className="gh-surface text-center py-12">
                        <p className="text-sm">No giveaways available at the moment.</p>
                    </div>
                </>
            ) : (
                <>
                    <SectionHeader title="Loot giveaways" subtitle="Free keys, DLC and in-game items" onPrev={prevItem} onNext={nextItem} />
                    <div className="gh-scroller relative overflow-hidden -mx-1.5">
                        <div className="gh-track flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]" style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}>
                            {giveaways.map((giveaway) => {
                                const platforms = (giveaway.platforms || '').split(',').map(p => p.trim()).filter(Boolean);
                                return (
                                    <div key={giveaway.id} className="flex-none w-[44%] sm:w-[30%] md:w-1/4 lg:w-1/5 px-1.5">
                                        <div className="game-card group h-full flex flex-col" onClick={() => showGiveawayDetails(giveaway)}>
                                            <div className="aspect-[16/10] overflow-hidden bg-[#171a22]">
                                                <img loading="lazy" decoding="async" src={giveaway.thumbnail} alt={giveaway.title} width="300" height="188" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-3 flex flex-col flex-1">
                                                <h3 className="text-sm font-semibold text-white line-clamp-1">{giveaway.title}</h3>
                                                <p className="text-xs text-[#8a8f9c] mt-1 line-clamp-2">{giveaway.description}</p>
                                                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                                                    <span className="text-[11px] text-[#6b7080] truncate">
                                                        {platforms.slice(0, 2).join(', ')}
                                                        {platforms.length > 2 && ` +${platforms.length - 2}`}
                                                    </span>
                                                    <FaExternalLinkAlt className="flex-shrink-0 text-[10px] text-[#6b7080] group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
