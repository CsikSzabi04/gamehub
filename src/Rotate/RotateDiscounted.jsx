import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap"; 
import '../body.css';

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = 10000; 

        const gamesToShow = [...games, ...games];

        const carousel = carouselRef.current;
        const totalItemsToShow = gamesToShow.length;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % totalItems;
                gsap.to(carousel, {
                    x: -newIndex * 320, 
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true
                });
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [games]);
    //Math.random().toString(36).slice(2) + Date.now().toString(36) this is the randomKeyGenerator
    return (
        <section id="free-games" className="mb-8 s">
            <h2 className="text-2xl font-semibold mb-4">{name} 💸</h2>
            <div className="carousel-container overflow-hidden">
                <div className="carousel flex space-x-4" ref={carouselRef}>
                    {games.concat(games).map((game) => (
                        <div
                            key={Math.random().toString(36).slice(2) + Date.now().toString(36)}
                            className="game-card carousel-item min-h-[20%] max-h-[80%] flex flex-col justify-between"
                            onClick={() => showGameDetails(game)}
                        >
                            <img src={game.background_image} alt={game.name} className="game-image" />
                            <div className="game-details">
                                <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                <p className="text-sm text-gray-400">Original Price: {game.originalPrice} USD</p>
                                <p className="text-sm text-gray-400">Discount Price: {game.discountPrice} USD</p>
                            </div>
                            <div className="justify-end mt-10 mb-0 pb-0 ml-4">
                                <p className="text-sm text-gray-400">Deal Status: <span className="text-green-500">{game.Status}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
