import React, { useEffect, useRef, useState } from "react";
import './body.css';

export default function Carousel({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemWidth = 300;

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = 3000;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [games]);

    return (

        <section id="multiplayer-games" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{name}</h2>
            <div className="carousel-container overflow-hidden">
                <div className="carousel flex space-x-4">
                    <div className="carousel-container overflow-hidden relative">
                        <div className="carousel flex transition-transform" style={{ transform: `translateX(-${currentIndex * itemWidth}px)`, transition: "transform 1s ease", }} >
                            {games.map((x) => (
                                <div key={x.id} className="game-card carousel-item" onClick={() => showGameDetails(x)}>
                                    <img src={x.background_image} alt={x.name} className="game-image" />
                                    <div className="game-details">
                                        <h3 className="text-lg font-bold mb-2">{x.name}</h3>
                                        <p className="text-sm text-gray-400"> Released: {x.released || "N/A"} </p>
                                        <p className="text-sm text-gray-400"> Rating: {x.rating || "N/A"}/5 </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>


    );
}
