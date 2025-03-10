import { useEffect } from "react";
import { useState } from "react";

export default function Search({setGames, games, setSearchTrue}) {
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
            const response = await fetch(`https://gamehub-backend-zekj.onrender.com/game?title=${query}`);
            const data = await response.json();
            const filteredGames = data.filter(game => parseFloat(game.cheapest) <= parseFloat(maxPrice));
            setGames(filteredGames);
            setError(filteredGames.length == 0 ? "Unfortunately, I can't find this game! Sorry for the inconvenience..." : null);
            setSearchTrue(true);
        } catch (err) {
            console.error("Error fetching games:", err);
            setError("Something went wrong. Please try again.");
        }
    }
    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-wrap space-x-4  w-full ">
                <input className="p-2 mb-4 rounded-lg text-black w-full sm:w-64 bg-white"  type="text"  placeholder="Search games..."  value={query}  onChange={(e) => setQuery(e.target.value)} />
                <input className="p-2 mb-4 rounded-lg text-black w-full sm:w-32 bg-white"  type="number"   placeholder="Max Price"  value={maxPrice == 500 ? "" : maxPrice}  onChange={(e) => setMaxPrice(e.target.value || Infinity)} />
                <button className="p-2 bg-blue-500 text-white rounded-lg button"onClick={searchGames} > Search</button>
            </div>
        </div>
    );
};


