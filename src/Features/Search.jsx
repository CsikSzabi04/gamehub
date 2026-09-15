import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useT } from '../i18n/index.jsx';

export async function searchRawgGames(query, maxPrice = 500) {
  const response = await fetch(
    `https://api.rawg.io/api/games?key=984255fceb114b05b5e746dc24a8520a&search=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error(`RAWG request failed: ${response.status}`);
  const data = await response.json();
  const gamesWithPrices = (data.results || []).map(game => ({
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

  return gamesWithPrices.filter(
    (game) => parseFloat(game.cheapest) <= parseFloat(maxPrice)
  );
}

export default function Search({ setGames, setSearchTrue }) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [maxPrice] = useState(500);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Pages that don't own the search results (Discover, Review, Login...) don't pass setGames.
  // There the search sends the user to the home page, which runs the search itself.
  const canShowResults = typeof setGames === "function";

  useEffect(() => {
    if (!canShowResults || query.trim().length < 2) return;
    const debounceTimer = setTimeout(() => {
      searchGames();
    }, 500);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, maxPrice]);

  async function searchGames() {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (!canShowResults) {
      navigate("/", { state: { search: trimmed } });
      return;
    }

    setIsSearching(true);
    try {
      const filteredGames = await searchRawgGames(trimmed, maxPrice);
      setGames(filteredGames);
      setSearchTrue?.(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching games:", err);
      // Keep the key, not the text, so the message follows a language switch
      setError("common.error");
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
          placeholder={t("search.placeholder")}
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
          {t(error)}
        </motion.p>
      )}
    </div>
  );
}
