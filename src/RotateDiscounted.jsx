import React, { useState, useEffect } from "react";
import './body.css';

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => setCurrentIndex(i => (i + 1) % games.length), 3000);
      return () => clearInterval(interval);
    }, [games]);

    return (
        <section id="free-games" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{name} 💸</h2>
        <div className="carousel-container overflow-hidden">
            <div className="carousel flex space-x-4">
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex transition-transform" style={{ transform: `translateX(-${currentIndex * 320}px)`, transition: "transform 1s ease" }} >
                        {games.map((game) => (
                            <div key={game.id} className="game-card carousel-item" onClick={() => showGameDetails(game)}>
                                <img src={game.background_image} alt={game.name} className="game-image" />
                                <div className="game-details">
                                    <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                    <p className="text-sm text-gray-400">Original Price: {game.originalPrice} Ft</p>
                                    <p className="text-sm text-gray-400">Discount Price: {game.discountPrice} Ft</p>
                                    <p className="text-sm text-gray-400">Deal Ends: {game.endDate}</p>
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
