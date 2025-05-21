import { useState } from "react";
import { useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

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

  return (
    <div className="container mx-auto">
      <section id="featured-games" className="">
        <h2 className="text-xl font-semibold mb-3">Featured Games</h2>
        <div id="games-grid" className="grid grid-cols-1 md:grid-cols-3 ">
          {randomGames.length > 0 ? (
            <>
              <div key={randomGames[0].id} className="md:col-span-2 md:row-span-1 hover:shadow-lg mr-5 transition transform cursor-pointer  bg-[url(${randomGames[0].background_image})] relative group" onClick={() => showGameDetails(randomGames[currentFeaturedIndex])}>
                <img src={randomGames[currentFeaturedIndex].background_image} alt={randomGames[0].name} className="min-w-[100%] min-h-[75%] max-w-[100%] max-h-[75%] object-cover rounded-md " />
                <h3 className="text-md font-bold truncate ">{randomGames[currentFeaturedIndex].name}</h3>
                <p className="text-xs text-gray-400">Released: {randomGames[currentFeaturedIndex].released}</p>
                <p className="text-xs text-gray-400">Rating: {randomGames[currentFeaturedIndex].rating}/5</p>
                <Link to={`/allreview/${randomGames[currentFeaturedIndex].id}`} className="absolute bottom-2 right-2 bg-gray-700/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}><FaExternalLinkAlt className="text-xs" /></Link>
              </div>
              <div className="md:col-span-1 flex flex-col gap-2">
                {randomGames.map((game, index) => (index !== currentFeaturedIndex && (
                  <div key={game.id} className=" hover:shadow-lg hover:scale-105 transition transform cursor-pointer flex flex-col bg-[url(${game.background_image})] relative group" onClick={() => showGameDetails(game)}>
                    <img src={game.background_image} alt={game.name} className="w-full h-24 object-cover rounded-md" />
                    <div className="game-details p-1">
                      <h3 className="text-sm font-bold truncate">{game.name}</h3>
                      <p className="text-xs text-gray-400">Released: {game.released}</p>
                      <p className="text-xs text-gray-400">Rating: {game.rating}/5</p>
                    </div>
                    <Link to={`/allreview/${game.id}`} className="absolute bottom-2 right-2 bg-gray-700/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}><FaExternalLinkAlt className="text-xs" /></Link>
                  </div>
                )))}
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
