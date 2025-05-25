import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function FeaturedGames({ allGames, showGameDetails }) {
    const getRandomGames = () => {
        if (!Array.isArray(allGames)) return [];
        
        const shuffled = [...allGames].sort(() => 0.5 - Math.random());
        
        if (window.innerWidth < 640) { 
            return shuffled.slice(0, 3);
        } else if (window.innerWidth < 1024) {
            return shuffled.slice(0, 5);
        } else {
            return shuffled.slice(0, 10);
        }
    };

    const [randomGames, setRandomGames] = React.useState(getRandomGames());

    React.useEffect(() => {
        const handleResize = () => {
            setRandomGames(getRandomGames());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [allGames]);

    return (
        <div className="container mx-auto p-4">
            <section id="featured-games" className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
                <div id="games-grid" className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {randomGames.length > 0 ? (
                        randomGames.map((game) => (
                            <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform flex-shrink-0 cursor-pointer transform hover:scale-105 transition-all duration-300 group/card" onClick={() => showGameDetails(game)}>
                                <div className="relative overflow-hidden rounded-md md:rounded-lg h-32 sm:h-36 md:h-40">
                                    <img  loading="lazy"  src={game.background_image} alt={game.name} className="game-image w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                                    <Link to={`/allreview/${game.id}`} className="absolute bottom-3 right-3 bg-gray-700/90 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100 transform translate-y-2 group-hover/card:translate-y-0 hover:scale-110 hover:shadow-blue-500/30" onClick={(e) => e.stopPropagation()}><FaExternalLinkAlt className="text-xs text-white" /></Link>
                                </div>
                                <div className="game-details">
                                    <h3 className="text-lg font-bold mb-2 truncate">{game.name}</h3>
                                    <p className="text-sm text-gray-400">Released: {game.released || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Rating: {game.rating || 'N/A'}/5</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white">No games found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}