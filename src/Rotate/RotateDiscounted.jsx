import React, { useState, useEffect } from "react";
import '../body.css';

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
                    <div className="carousel flex transition-transform flex-none " style={{ transform: `translateX(-${currentIndex * 320}px)`, transition: "transform 1s ease" }} >
                        {games.map((game) => (
                            <div key={game.id} className="game-card carousel-item min-h-[20%] max-h-[80%] flex flex-col justify-between " onClick={() => showGameDetails(game)}>
                                <img src={game.background_image} alt={game.name} className="game-image" />
                                <div className="game-details">
                                    <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                    <p className="text-sm text-gray-400">Original Price: {game.originalPrice} USD</p>
                                    <p className="text-sm text-gray-400">Discount Price: {game.discountPrice} USD</p>
                                   
                                </div>
                                <div className="justify-end mt-10 mb-0 pb-0 ml-4">
                                     <p className="text-sm text-gray-400">Deal Status: <span className="text-green-500">{game.Status}</span> </p>
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
