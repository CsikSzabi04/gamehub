import { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss";

export default function EsportsMatches() {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await axios.get("https://gamehub-backend-zekj.onrender.com/getlive");
        setMatches(response.data.events);
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
    }
    fetchMatches();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % matches.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [matches]);

  return (
    <section id="matches" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Latest Esports Matches</h2>
      <div className="carousel-container overflow-hidden p-10">
        <div className="carousel flex p-10" style={{ transform: `translateX(-${currentIndex * 20}%)`, transition: "transform 1s ease-in-out" }}>
          {matches.map((match) => (
            <div key={match.id} className="game-card carousel-item flex-none border-cyan-950">
              <div className="p-4 rounded-md shadow-md min-h-[20%] max-h-[80%] flex flex-col justify-between h-full">
                <div className="relative mb-4">
                  <h3 className="text-lg font-bold mb-2">{match.tournament.name}</h3>
                  <p className="text-sm text-gray-400">Season: {match.season.name}</p>
                  <p className="text-sm text-gray-400">Status: {match.status.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-center">
                      <p className="font-bold text-blue-500">{match.homeTeam.name}</p>
                      <p className="text-lg font-semibold">{match.homeScore.display}</p>
                    </div>
                    <p className="text-lg font-semibold">VS</p>
                    <div className="text-center">
                      <p className="font-bold text-red-500">{match.awayTeam.name}</p>
                      <p className="text-lg font-semibold">{match.awayScore.display}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-grow mt-10"></div>
              </div>
              <div className="float-start">
                <p className="text-xs text-gray-500 mt-2"> {`Start Time: ${new Date(match.startTimestamp * 1000).toLocaleString()}`}</p>
                <p className="text-xs text-gray-500 mt-3"> {`Best Of: ${match.bestOf}`}</p>
                <a href={`https://www.esports.com/tournament/${match.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm mt-3 block mt-auto"> View Match Details</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
