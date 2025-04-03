import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";

export default function Giveaways() {
    const [giveaways, setGiveaways] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardsToShow = 4;

    useEffect(() => {
        fetchGiveaways();
    }, []);

    async function fetchGiveaways() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/loot");
            const data = await response.json();

            const giveawaysData = data.map((giveaway) => ({
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

            setGiveaways(giveawaysData);
        } catch (error) {
            console.error("Error fetching giveaways:", error);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                setCurrentIndex(prev => (prev + 1) % Math.max(1, giveaways.length - cardsToShow + 1));
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [giveaways.length, isAnimating]);

    function showGiveawayDetails(giveaway) {
        window.open(giveaway.openGiveawayUrl, "_blank");
    }

    function nextItem() {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % Math.max(1, giveaways.length - cardsToShow + 1));
        setTimeout(() => setIsAnimating(false), 500);
    }

    function prevItem() {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex(prev => (prev - 1 + (giveaways.length - cardsToShow + 1)) % (giveaways.length - cardsToShow + 1));
        setTimeout(() => setIsAnimating(false), 500);
    }
    if (!giveaways.length) return <div className="text-center py-8">Loading giveaways...</div>;

    return (
        <div className="bg-gray-600/20 sm:p-10 rounded-lg mt-15">
        <section className="mb-8 px-4 relative">
            <h2 className="text-2xl font-semibold mb-4">Loot 💰</h2>
            <div className="relative">
                <button onClick={prevItem} className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full -ml-2 transition-all duration-200 hover:scale-110" disabled={currentIndex === 0} >
                    <FaChevronLeft size={14} />
                </button>
                <div className="relative overflow-hidden px-8 ">
                    <div className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] " style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}>
                        {giveaways.map((giveaway) => (
                            <div key={giveaway.id} className="flex-none w-1/4 p-2 min-w-[25%] game-card m-2" >
                                <div className="bg-gray-800 p-3 rounded-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1" onClick={() => showGiveawayDetails(giveaway)} >
                                    <div className="relative mb-3 h-32 overflow-hidden rounded-md">
                                        <img src={giveaway.thumbnail} alt={giveaway.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                                    </div>
                                    <h3 className="text-sm font-bold mb-1 line-clamp-1">{giveaway.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{giveaway.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded transition-all duration-200 hover:bg-gray-600">
                                            {giveaway.platforms}
                                        </span>
                                        <FaExternalLinkAlt className="text-blue-400 text-xs transition-all duration-200 hover:text-blue-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={nextItem} className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full -mr-2 transition-all duration-200 hover:scale-110" disabled={currentIndex >= giveaways.length - cardsToShow}>
                    <FaChevronRight size={14} />
                </button>
            </div>

            <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: Math.max(1, giveaways.length - cardsToShow + 1) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-6' : 'bg-gray-600'}`}
                    />
                ))}
            </div>
        </section>
        </div>
    );
}