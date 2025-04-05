import { useState } from "react";
import Pagination from "@mui/material/Pagination"; import { FaArrowLeftLong } from "react-icons/fa6";


export default function SearchFind({ setGames, games }) {
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 10;
    const pageCount = Math.ceil(games.length / gamesPerPage);

    const paginate = (pageNumber) => { setCurrentPage(pageNumber); };
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
    function Home() { location.reload(); }

    return (
        <div className="bg-gray-900 flex flex-col items-center mx-4 sm:mx-10 md:mx-20 p-4 sm:p-10 m-4 sm:m-10 relative">

            <button type="button" onClick={Home} className="absolute left-4 sm:left-10 top-4 sm:top-10 flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                <FaArrowLeftLong />
                <span className="ml-3">Home</span>
            </button>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-12">
                {currentGames.map((game) => (
                    <div key={game.gameID} className="game-card w-full p-4 flex flex-col items-center hover:transform hover:scale-105 transition-transform duration-200">
                        <img src={game.thumb || `https://via.placeholder.com/200x250?text=${encodeURIComponent(game.external)}`} alt={game.external} className="game-image w-full h-48 sm:h-56 object-cover rounded-md mb-2 shadow-lg" />
                        <div className="game-details w-full bg-gray-800 p-3 rounded-md text-center">
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{game.external}</h3>
                            <p className="price text-green-400 font-medium">${game.cheapest}</p>
                            <a href={`https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-gray-900 px-3 py-1 rounded-md text-sm transition-colors" >
                               <span className="text-gray-100">View Deal</span> 
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full p-4 bg-gray-900 flex justify-center mt-4">
                <div className="bg-gray-800 p-2 rounded-md shadow-lg">
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
