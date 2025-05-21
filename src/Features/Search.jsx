import { useEffect } from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function Search({ setGames, games, setSearchTrue }) {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      searchGames();
    }
  }, [maxPrice]);

  async function searchGames() {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=984255fceb114b05b5e746dc24a8520a&search=${query}`
      );
      const data = await response.json();
      const gamesWithPrices = data.results.map(game => ({
        ...game,
        cheapest: Math.floor(Math.random() * 100) + 10,
        cheapestDealID: Math.random().toString(36).substring(7),
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
    }
  }

  return (
    <div className="flex flex-wrap ">
      <div className="relative sm:w-64">
        <input
          className="p-2 pr-12 rounded-lg text-black w-full bg-white pl-10"
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") searchGames();
          }}
        />
        <button onClick={searchGames}>
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </button>
      </div>
    </div>
  );
}