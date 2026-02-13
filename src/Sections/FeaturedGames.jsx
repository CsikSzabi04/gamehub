import React from 'react';
import { FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        <div className="w-full mb-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Games</h2>
                    <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"></div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {randomGames.length > 0 ? (
                    randomGames.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8 }}
                            onClick={() => showGameDetails(game)}
                            className="group relative overflow-hidden rounded-2xl cursor-pointer bg-white/5 border border-white/5 hover:border-violet-500/40 transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    loading="lazy"
                                    src={game.background_image}
                                    alt={game.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                
                                {/* Rating Badge */}
                                {game.rating && (
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                                        <FaStar className="text-[10px]" />
                                        {game.rating}
                                    </div>
                                )}
                                
                                {/* External Link Icon */}
                                <Link 
                                    to={`/allreview/${game.id}`}
                                    className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-black/60 hover:bg-violet-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaExternalLinkAlt className="w-3 h-3 text-white" />
                                </Link>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-white font-semibold text-sm md:text-base truncate mb-2 group-hover:text-violet-300 transition-colors">
                                    {game.name}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        📅 {game.released || 'TBA'}
                                    </span>
                                    {game.genres?.[0] && (
                                        <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                            {game.genres[0].name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <span className="text-3xl">🎮</span>
                            </div>
                            <p className="text-gray-400">No games found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
