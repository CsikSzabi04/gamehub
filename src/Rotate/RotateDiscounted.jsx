import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import '../body.css';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemWidth = 400;

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = 15000;
        const carousel = carouselRef.current;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % totalItems;
                gsap.to(carousel, {
                    x: -newIndex * itemWidth,
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true
                });
                return newIndex;
            });
        }, intervalTime);
        return () => clearInterval(rotateInterval);
    }, [games]);

    function nextItem() {
        const carousel = carouselRef.current;
        const newIndex = (currentIndex + 2) % games.length;
        gsap.to(carousel, {
            x: -newIndex * 500,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    };

    function prevItem() {
        const carousel = carouselRef.current;
        const newIndex = (currentIndex - 2 + games.length) % games.length;
        gsap.to(carousel, {
            x: -newIndex * 500,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    };

    return (
        <div className="relative">
            <section id="free-games" className="mb-8 s">
                <h2 className="text-2xl font-semibold mb-4">{name} 💸</h2>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex space-x-4" ref={carouselRef} style={{ width: `${games.length * 2 * itemWidth}px` }}>
                        {games.concat(games).map((game, index) => (
                          <div key={`${game.id}-${index}`} className="game-carda carousel-item min-h-[20%] max-h-[80%] flex flex-col justify-between cursor-pointer transform hover:scale-105 transition-all duration-300 group/card" style={{ width: `${itemWidth}px` }} onClick={() => showGameDetails(game)}>                                <div className="relative overflow-hidden rounded-md md:rounded-lg h-32 sm:h-36 md:h-40">
                                    <img src={game.background_image} alt={game.name} className="game-image w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                                </div>
                                <div className="game-details p-2 sm:p-3 md:p-4 bg-gray-800/80 rounded-b-md md:rounded-b-lg flex flex-col justify-between min-h-[120px]">
                                    <div>
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 text-white line-clamp-1">{game.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-300">Original: {(game.originalPrice * 1.3).toFixed(2)} USD</p>
                                        <p className="text-xs sm:text-sm text-gray-300">Discount: {game.discountPrice} USD</p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs sm:text-sm text-gray-300">Deal Status: <span className="text-green-500">{game.Status}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="d">
                <button onClick={prevItem} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr"><FaAngleLeft /> </button>
                <button onClick={nextItem} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr" ><FaChevronRight /> </button>
            </div>
        </div>
    );
}
