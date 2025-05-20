import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import '../body.css';
import { FaChevronRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";


export default function Rotate({ games, showGameDetails, name, intervalTimeA, k }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = intervalTimeA;

        const gamesToShow = [...games, ...games];

        const carousel = carouselRef.current;
        const totalItemsToShow = gamesToShow.length;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 2) % totalItems;
                gsap.to(carousel, {
                    x: -newIndex * k,
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
        setCurrentIndex(prevIndex => (prevIndex + 1) % games.length);
    };

    const prevItem = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + games.length) % games.length);
    };

    return (
        <div className="relative group" >
            <section id="multiplayer-games" className="mb-8 md:mb-12 relative px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">{name}</h2>
                <div className="overflow-hidden relative rounded-lg md:rounded-xl">
                    <div className="flex space-x-3 md:space-x-4">
                        <div className="overflow-hidden relative w-full">
                            <div className="flex transition-transform duration-300 ease-out"  ref={carouselRef} style={{ transform: `translateX(-${currentIndex * (window.innerWidth < 640 ? 240 : 320)}px)` }}>
                                {games.concat(games).map((x, index) => (
                                    <div key={`${x.id}-${index}`} className="game-card carousel-item w-[220px] sm:w-[260px] md:w-[300px] flex-shrink-0 cursor-pointer transform hover:scale-105 transition-all duration-300 group/card" onClick={() => showGameDetails(x)}>
                                        <div className="relative overflow-hidden rounded-md md:rounded-lg h-32 sm:h-36 md:h-40">
                                            <img src={x.background_image} alt={x.name} className="game-image w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                                            <Link to={`/allreview/${x.id}`} className="absolute bottom-3 right-3 bg-gray-700/90 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100 transform translate-y-2 group-hover/card:translate-y-0 hover:scale-110 hover:shadow-blue-500/30" onClick={(e) => e.stopPropagation()}><FaExternalLinkAlt className="text-xs text-white" /></Link>
                                        </div>
                                        <div className="game-details p-2 sm:p-3 md:p-4  rounded-b-md md:rounded-b-lg">
                                            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 text-white line-clamp-1">{x.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-300">Released: {x.released}</p>
                                            <p className="text-xs sm:text-sm text-gray-300">Rating: {x.rating}/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="controls opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={prevItem} className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"><FaAngleLeft className="text-lg sm:text-xl" /></button>
                <button onClick={nextItem} className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"><FaChevronRight className="text-lg sm:text-xl" /></button>
            </div>
        </div>
    );
}
