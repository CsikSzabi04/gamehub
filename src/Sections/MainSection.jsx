import { useState } from "react";
import { useEffect } from "react";
import { FaExternalLinkAlt, FaPlay, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export default function MainSection({ allGames, showGameDetails }) {
  const [randomGames, setRandomGames] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    setRandomGames([...allGames].sort(() => Math.random() - 0.5).slice(0, 4));
  }, [allGames]);

  useEffect(() => {
    if (randomGames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) =>
          (prevIndex + 1) % randomGames.length
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [randomGames]);

  const currentGame = randomGames[currentFeaturedIndex];

  return (
    <div className="relative w-full mb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          {currentGame && (
            <motion.div
              key={currentGame.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] md:h-[600px] w-full"
            >
              {/* Image */}
              <img 
                src={currentGame.background_image} 
                alt={currentGame.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/80 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-2xl"
                >
                  {/* Featured Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                    Featured Game
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {currentGame.name}
                  </h2>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {currentGame.released && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-xs">📅</span>
                        {currentGame.released}
                      </div>
                    )}
                    {currentGame.rating && (
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                        <span className="text-lg">★</span>
                        {currentGame.rating}/5
                      </div>
                    )}
                    {currentGame.genres?.[0] && (
                      <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-gray-300 text-sm">
                        {currentGame.genres[0].name}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showGameDetails(currentGame)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                    >
                      <FaPlay className="text-sm" />
                      View Details
                    </motion.button>
                    
                    <Link to={`/allreview/${currentGame.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                      >
                        <FaExternalLinkAlt className="text-sm" />
                        Reviews
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Slide Indicators */}
        {randomGames.length > 0 && (
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-2">
            {randomGames.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeaturedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFeaturedIndex
                    ? 'w-8 bg-violet-500'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Side Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {randomGames.slice(1).map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => showGameDetails(game)}
            className="group relative overflow-hidden rounded-2xl cursor-pointer bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all"
          >
            {/* Image */}
            <div className="relative h-32 md:h-40">
              <img
                loading="lazy"
                src={game.background_image}
                alt={game.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent"></div>
              
              {/* Rating Badge */}
              {game.rating && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  ★ {game.rating}
                </div>
              )}
              
              {/* External Link Icon */}
              <Link 
                to={`/allreview/${game.id}`} 
                className="absolute top-3 left-3 p-2 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <FaExternalLinkAlt className="w-3 h-3 text-white" />
              </Link>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm md:text-base truncate mb-2">
                {game.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{game.released || 'TBA'}</span>
                {game.genres?.[0] && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">
                    {game.genres[0].name}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
