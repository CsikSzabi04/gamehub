import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!games.length || !carouselRef.current) return;
        
        const intervalTime = 15000;
        
        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % games.length;
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [games]);

    useEffect(() => {
        if (carouselRef.current && games.length > 0) {
            gsap.to(carouselRef.current, {
                x: -currentIndex * 320,
                duration: 1,
                ease: "power2.inOut"
            });
        }
    }, [currentIndex, games.length]);

    function nextItem() {
        const newIndex = (currentIndex + 1) % games.length;
        setCurrentIndex(newIndex);
    }

    function prevItem() {
        const newIndex = (currentIndex - 1 + games.length) % games.length;
        setCurrentIndex(newIndex);
    }

    if (!games || games.length === 0) {
        return (
            <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">{name}</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-4 md:p-6" data-aos="fade-up">
            <h2 className="text-2xl font-semibold mb-4 text-white">{name}</h2>
            
            <div className="relative">
                <button 
                    onClick={prevItem} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 md:p-3 rounded-full transition-colors -translate-x-2 md:translate-x-0"
                    aria-label="Previous game"
                >
                    <FaAngleLeft size={20} />
                </button>

                <div className="overflow-hidden mx-8">
                    <div 
                        ref={carouselRef} 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ width: `${games.length * 320}px` }}
                    >
                        {games.map((game, index) => (
                            <div 
                                key={`${game.id}-${index}`} 
                                className="w-72 md:w-80 flex-shrink-0 px-2"
                            >
                                <div 
                                    className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 group"
                                    onClick={() => showGameDetails(game)}
                                >
                                    <div className="relative h-36 md:h-40 overflow-hidden">
                                        <img 
                                            loading="lazy"
                                            src={game.background_image} 
                                            alt={game.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                                        <div className="absolute right-2 top-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            SALE
                                        </div>
                                    </div>

                                    <div className="p-3 md:p-4">
                                        <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 mb-2">
                                            {game.name}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 line-through text-xs">
                                                ${(game.originalPrice * 1.3).toFixed(2)}
                                            </span>
                                            <span className="text-green-500 font-bold text-sm">
                                                ${game.discountPrice}
                                            </span>
                                        </div>

                                        <div className="mt-2">
                                            <span className="text-green-500 text-xs">
                                                {game.Status || "Active"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={nextItem} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 md:p-3 rounded-full transition-colors translate-x-2 md:translate-x-0"
                    aria-label="Next game"
                >
                    <FaChevronRight size={20} />
                </button>
            </div>

            <div className="flex justify-center mt-4 gap-2">
                {games.slice(0, 10).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            currentIndex === index ? 'bg-violet-500' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
