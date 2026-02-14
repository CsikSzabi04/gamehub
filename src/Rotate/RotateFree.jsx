import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";

export default function RotateFree({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!games.length || !carouselRef.current) return;
        
        const intervalTime = 20000;
        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % games.length;
                gsap.to(carouselRef.current, {
                    x: -newIndex * 1000,
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true
                });
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [games]);

    const nextItem = () => {
        const newIndex = (currentIndex + 1) % games.length;
        setCurrentIndex(newIndex);
        gsap.to(carouselRef.current, {
            x: -newIndex * 1000,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
    };

    const prevItem = () => {
        const newIndex = (currentIndex - 1 + games.length) % games.length;
        setCurrentIndex(newIndex);
        gsap.to(carouselRef.current, {
            x: -newIndex * 1000,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
    };

    return (
        <section id="free-games" data-aos="fade-up" className="mb-6 px-4 relative bg-gray-600/20 p-4">
            <h2 className="text-2xl font-semibold mb-4">{name} 🎁</h2>
            <div className="relative group pl-2 pr-2">
                <button onClick={prevItem} className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"  aria-label="Previous game"  > <FaAngleLeft size={20} /> </button>
                <div className="relative overflow-hidden">
                    <div ref={carouselRef} className="carousel flex transition-transform duration-500 ease-out">
                        {games.map((game) => (
                            <div key={game.id} className="game-card carousel-item flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
                                <div className="bg-gray-800 p-4 rounded-md shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col cursor-pointer"onClick={() => showGameDetails(game)} >
                                    <div className="relative mb-4 overflow-hidden rounded-md">
                                        <img  loading="lazy"  src={game.thumbnail} alt={game.title} className="h-48 w-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{game.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">{game.short_description}</p>
                                    <div className="mt-auto">
                                        <p className="text-xs text-gray-500 mt-2">Released: {new Date(game.release_date).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-500 mt-1">Platform: {game.platform}</p>
                                        <button className="inline-block text-blue-500 hover:text-blue-400 text-sm mt-3 transition-colors duration-200">View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={nextItem} className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-label="Next game"><FaChevronRight size={20} /></button>
            </div>
        </section>
    );
}