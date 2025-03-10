import React, { useState, useEffect } from "react";
import './body.css';

export default function RotateLoot({ giveaways, showGiveawayDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex(i => (i + 1) % giveaways.length), 8000);
        return () => clearInterval(interval);
    }, [giveaways]);

    return (
        <div className="bg-gray-600/20 sm:p-10 rounded-lg">
            <section id="loot-giveaways" className="mb-2 p-6">
                <h2 className="text-2xl font-semibold mb-4">{name} 💰</h2>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 320}px)` }}>
                        {giveaways.map((giveaway) => (
                            <div key={giveaway.id} className="giveaway-card flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mr-6" onClick={() => showGiveawayDetails(giveaway)} >
                                <img src={giveaway.thumbnail} alt={giveaway.title} className="object-cover rounded-md mb-4" />
                                <div className="giveaway-details">
                                    <h3 className="text-lg font-bold">{giveaway.title}</h3>
                                    <div className="mt-[5%]">
                                        <p className="text-sm text-gray-400">{giveaway.description}</p>
                                        <div className="platforms text-sm text-gray-600">
                                            <span className="font-semibold ">Platforms:</span> {giveaway.platforms}
                                        </div>
                                        <p className="text-sm text-gray-500">Published: {new Date(giveaway.publishedDate).toLocaleDateString()}</p>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
