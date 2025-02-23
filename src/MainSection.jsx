import { useState } from "react";
import { useEffect } from "react";

export default function MainSection({ allGames, showGameDetails }) {
    
    const [randomGames, setRandomGames] = useState([]);

    useEffect(() => {
        setRandomGames([...allGames].sort(() => Math.random() - 0.5).slice(0, 4));
    }, [allGames]);


    return (
        <div className="container mx-auto p-2">
            <section id="featured-games" className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Featured Games</h2>
                <div id="games-grid" className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {randomGames.length > 0 ? (
                        <>
                            <div key={randomGames[0].id} className="`game-card md:col-span-2 md:row-span-1 hover:shadow-lg mr-5 transition transform cursor-pointer bg-[url(${randomGames[0].background_image})]`" onClick={() => showGameDetails(randomGames[0])}>
                                <img src={randomGames[0].background_image} alt={randomGames[0].name} className="w-10% h-10% max-h-100 object-cover rounded-md" />
                                <h3 className="text-md font-bold truncate">{randomGames[0].name}</h3>
                                <p className="text-xs text-gray-400">Released: {randomGames[0].released }</p>
                                <p className="text-xs text-gray-400">Rating: {randomGames[0].rating }/5</p>
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-2">
                                {randomGames.slice(1).map((game) => (
                                    <div key={game.id} className="`game-card hover:shadow-lg hover:scale-105 transition transform cursor-pointer flex flex-col bg-[url(${game.background_image})]`" onClick={() => showGameDetails(game)}>
                                        <img src={game.background_image} alt={game.name} className="w-full h-24 object-cover rounded-md" />
                                        <div className="game-details p-1">
                                            <h3 className="text-sm font-bold truncate">{game.name}</h3>
                                            <p className="text-xs text-gray-400">Released: {game.released }</p>
                                            <p className="text-xs text-gray-400">Rating: {game.rating }/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-white">No games found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
