import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import './body.css';

export default function Carousel({ games, showGameDetails }) {
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!carouselRef.current || games.length === 0) return;

        const carousel = carouselRef.current;
        let currentIndex = 0;
        const totalItems = games.length;
        const intervalTime = 3000; // Rotate every 3 seconds

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            gsap.to(carousel, {
                x: -currentIndex * 240,
                duration: 1.5,
                ease: "power2.inOut",
                overwrite: true,
            });
        }, intervalTime);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [games]);

    return (
        <div className="carousel-container overflow-hidden relative">
            <div
                ref={carouselRef}
                className="carousel flex space-x-4 transition-transform"
                style={{ width: `${games.length * 8}%` }} // Ensure dynamic width
            >
                {games.map((game) => (
                   <div key={game.id} className="game-card carousel-item" onClick={() => showGameDetails(game)}>
                   <img src={game.background_image} alt={game.name} className="game-image" />
                   <div className="game-details">
                       <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                       <p className="text-sm text-gray-400">Released: {game.released || "N/A"}</p>
                       <p className="text-sm text-gray-400">Rating: {game.rating || "N/A"}/5</p>
                   </div>
               </div>
                ))}
            </div>
        </div>
    );
}