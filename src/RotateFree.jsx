import React, { useState, useEffect } from "react";
import './body.css';

export default function RotateFree({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex(i => (i + 1) % games.length), 3000);
        return () => clearInterval(interval);
    }, [games]);

    return (
        <div className="bg-gray-600/20 p-10 rounded-lg">
            <section id="free-games " className="mb-2">
                <h2 className="text-2xl font-semibold mb-4">{name} 🎁</h2>
                <div className="carousel-container overflow-hidden ">
                    <div className="carousel flex space-x-4">
                        <div className="carousel-container overflow-hidden relative">
                            <div className="carousel flex transition-transform" style={{ transform: `translateX(-${currentIndex * 320}px)`, transition: "transform 1s ease", }} >
                                {games.map((game) => (
                                    <div key={game.id} className="game-card carousel-item" onClick={() => showGameDetails(game)}>
                                        <img src={game.thumbnail} alt={game.title} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold">{game.title}</h3>
                                            <p className="text-sm text-gray-500 "> Released: {new Date(game.release_date).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-400 ">{game.short_description}</p>
                                            <div className="platforms text-sm text-gray-600">
                                                <span className="font-semibold">Platform:</span> {game.platform}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
