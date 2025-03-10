import { useState } from "react";
import Pagination from "@mui/material/Pagination";

export default function SearchFind({ setGames, games }) {
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 10; 
    const pageCount = Math.ceil(games.length / gamesPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

    return (
        <div className="bg-gray-900 flex flex-col items-center mx-20 search p-10 m-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {currentGames.map((game) => (
                    <div key={game.gameID} className="game-card w-full p-4 flex flex-col items-center">
                        <img src={game.thumb || `https://via.placeholder.com/200x250?text=${encodeURIComponent(game.external)}`} alt={game.external} className="game-image w-full h-auto rounded-md mb-2"/>
                        <div className="game-details sm:text-left bg-gray-800 p-2 rounded-md flex flex-col items-center">
                            <h3 className="text-xl font-bold mb-2">{game.external}</h3>
                            <p className="price">Best Price: ${game.cheapest}</p>
                            <a href={`https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`} target="_blank"  rel="noopener noreferrer" className="text-blue-500 underline"> View Deal</a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-900 text-white w-full flex justify-center">
                <div className="bg-gray-800 p-2 rounded-md">
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={(event, value) => paginate(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </div>
            </div>
        </div>
    );
}
