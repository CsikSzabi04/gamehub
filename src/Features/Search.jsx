import { useEffect } from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from 'framer-motion';

export default function Search({ setGames, games, setSearchTrue }) {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query && query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchGames();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, maxPrice]);

  async function searchGames() {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=984255fceb114b05b5e746dc24a8520a&search=${query}`
      );
      const data = await response.json();
      const gamesWithPrices = data.results.map(game => ({
        ...game,
        external: game.name,
        thumb: game.background_image,
        gameID: game.id,
        playtime: game.playtime,
        rating: game.rating,
        rating_top: game.rating_top,
        ratings_count: game.ratings_count,
        metacritic: game.metacritic,
        esrb_rating: game.esrb_rating?.name ?? "Not rated",
        cheapest: Math.floor(Math.random() * 100) + 10,
        cheapestDealID: Math.random().toString(36).substring(7),
      }));

      const filteredGames = gamesWithPrices.filter(
        (game) => parseFloat(game.cheapest) <= parseFloat(maxPrice)
      );

      setGames(filteredGames);
      setSearchTrue(true);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="w-full">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full"
            />
          ) : (
            <FaSearch className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <input
          id="search-input"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchGames();
          }}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
