import React from 'react';

export default function FeaturedGames({ allGames, showGameDetails}) {
    return (
        <div className="container mx-auto p-4">
            <section id="featured-games" className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
                <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.isArray(allGames) && allGames.length > 0 ? (
                        allGames.map((game) => (
                            <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer" onClick={() => showGameDetails(game)}>
                                <img src={game.background_image} alt={game.name} className="game-image" />
                                <div className="game-details">
                                    <h3 className="text-lg font-bold mb-2 truncate">{game.name}</h3>
                                    <p className="text-sm text-gray-400">Released: {game.released || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Rating: {game.rating || 'N/A'}/5</p>
                                </div>
                            </div>
                        ))
                    ) : (<p className="text-white">No games found.</p>)}
                </div>
            </section>
        </div>
    );
}