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
        `https://gamehub-backend-zekj.onrender.com/game?title=${query}`
      );
      const data = await response.json();
      const filteredGames = data.filter(
        (game) => parseFloat(game.cheapest) <= parseFloat(maxPrice)
      );
      setGames(filteredGames);
      setError(
        filteredGames.length == 0
          ? "Unfortunately, I can't find this game! Sorry for the inconvenience..."
          : null
      );
      setSearchTrue(true);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Something went wrong. Please try again.");
    }
  }

  
  

  return (
      <div className="flex flex-wrap ">
        <div className="relative sm:w-64">
          <input className="p-2 pr-12 rounded-lg text-black w-full bg-white pl-10" type="text" placeholder="Search games..." value={query} onChange={(e) => setQuery(e.target.value)}  onKeyDown={(e) => {if (e.key == "Enter") searchGames();}}/>
          <button onClick={searchGames}><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" /></button>
        </div>
        {/* <div className="relative w-full sm:w-32"> <input className="p-2 rounded-lg text-black w-full bg-white" type="number" placeholder="Max Price" value={maxPrice == 500 ? "" : maxPrice} onChange={(e) => setMaxPrice(e.target.value || Infinity)}/> </div>*/}
      </div>
   
  );
}
