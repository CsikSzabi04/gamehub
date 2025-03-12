import React, { useEffect, useRef, useState } from "react";
import '../body.css';

export default function Rotate({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => setCurrentIndex(i => (i + 2) % games.length), 3000);
      return () => clearInterval(interval);
    }, [games]);
    

    return (
        <section id="multiplayer-games" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{name}</h2>
            <div className=" overflow-hidden">
                <div className=" flex space-x-4">
                    <div className=" overflow-hidden relative">
                        <div className=" flex transition-transform" style={{ transform: `translateX(-${currentIndex * 300}px)`, transition: "transform 1s ease", }} >
                            {games.map((x) => (
                                <div key={x.id} className="game-card carousel-item" onClick={() => showGameDetails(x)}>
                                    <img src={x.background_image} alt={x.name} className="game-image" />
                                    <div className="game-details">
                                        <h3 className="text-lg font-bold mb-2">{x.name}</h3>
                                        <p className="text-sm text-gray-400"> Released: {x.released || "?"} </p>
                                        <p className="text-sm text-gray-400"> Rating: {x.rating || "?"}/5 </p>
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
