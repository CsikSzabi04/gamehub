import { useState, useEffect } from "react";

export default function MainSection({ allGames, showGameDetails }) {
    const [randomGames, setRandomGames] = useState([]);

    useEffect(() => {
        setRandomGames([...allGames].sort(() => Math.random() - 0.5).slice(0, 4));
    }, [allGames]);

    return (
        <div className="container mx-auto bg-gray-900 p-4 mt-6 mb-6" data-aos="fade-up">
            <section id="featured-games" className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Featured Games</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {randomGames.length > 0 ? (
                        <>
                            <div className="md:col-span-1 flex flex-col gap-4">
                                {randomGames.slice(1).map((game) => (
                                    <div key={game.id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group flex-1" onClick={() => showGameDetails(game)} >
                                        <div className="relative h-24 w-full">
                                    <img  loading="lazy"  src={game.background_image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 group-hover:from-black">
                                                <h3 className="text-sm font-semibold text-white truncate">{game.name}</h3>
                                                <div className="flex justify-between text-xs text-gray-300 mt-1">
                                                    <span>{game.released}</span>
                                                    <span className="bg-blue-900/50 px-1.5 py-0.5 rounded-full">
                                                        {game.rating.toFixed(1)}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div key={randomGames[0].id} className="md:col-span-2 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={() => showGameDetails(randomGames[0])}>
                                <div className="relative h-64 md:h-80 w-full">
                                    <img  loading="lazy"  src={randomGames[0].background_image} alt={randomGames[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 group-hover:from-black">
                                        <h3 className="text-xl font-bold text-white">{randomGames[0].name}</h3>
                                        <div className="flex justify-between text-sm text-gray-300 mt-1">
                                            <span>Released: {randomGames[0].released}</span>
                                            <span className="bg-blue-900/50 px-2 py-1 rounded-full text-white">
                                                {randomGames[0].rating.toFixed(1)}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-white col-span-full text-center py-8">Loading featured games...</p>
                    )}
                </div>
            </section>
        </div>
    );
}