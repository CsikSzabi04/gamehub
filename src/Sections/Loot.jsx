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
    <div className="bg-gray-600/20 rounded-lg mt-4 sm:mt-8 lg:mt-12 p-4 sm:p-6 lg:p-10" >
        <section className="mb-6 sm:mb-8 px-2 sm:px-4 relative">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4">Loot 💰</h2>
          
          <div className="relative">
            <button onClick={prevItem} className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-1 sm:p-2 rounded-full transition-all duration-200 hover:scale-110" disabled={currentIndex === 0}>
              <FaChevronLeft className="text-xs sm:text-sm" />
            </button>
      
            <div className="relative overflow-hidden px-6 sm:px-8" >
              <div className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}>
                {giveaways.map((giveaway) => {
                  const displayedPlatforms = giveaway.platforms.split(',').slice(0, 3).join(',');
                  const hasMorePlatforms = giveaway.platforms.split(',').length > 3;
                  return (
                    <div key={giveaway.id} className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 p-1 sm:p-2 min-w-[50%] sm:min-w-[33.33%] md:min-w-[25%] lg:min-w-[20%]" >
                      <div className="bg-gray-800 p-2 sm:p-3 rounded-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1"onClick={() => showGiveawayDetails(giveaway)} >
                        <div className="relative mb-2 sm:mb-3 h-20 sm:h-28 md:h-32 lg:h-36 overflow-hidden rounded-md">
                          <img src={giveaway.thumbnail} alt={giveaway.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"/>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold mb-1 line-clamp-1">{giveaway.title}</h3>
                        <p className="text-xxs sm:text-xs text-gray-400 mb-1 sm:mb-2 line-clamp-2">{giveaway.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-xxs sm:text-xs bg-gray-700 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded transition-all duration-200 hover:bg-gray-600">
                              {displayedPlatforms}
                              {hasMorePlatforms && (
                                <span className="text-gray-400 ml-1">+{giveaway.platforms.split(',').length - 3}</span>
                              )}
                            </span>
                          </div>
                          <FaExternalLinkAlt className="text-blue-400 text-xxs sm:text-xs transition-all duration-200 hover:text-blue-300" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
      
            <button onClick={nextItem} className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-1 sm:p-2 rounded-full transition-all duration-200 hover:scale-110" disabled={currentIndex >= giveaways.length - cardsToShow} >
              <FaChevronRight className="text-xs sm:text-sm" />
            </button>
          </div>
      
          <div className="flex justify-center mt-3 sm:mt-4 space-x-1 sm:space-x-2">
            {Array.from({ length: Math.max(1, giveaways.length - cardsToShow + 1) }).map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-4 sm:w-6' : 'bg-gray-600'}`}/>
            ))}
          </div>
        </section>
      </div>
    );
}
