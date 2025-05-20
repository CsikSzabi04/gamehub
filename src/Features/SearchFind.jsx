import { useState } from "react";
import Pagination from "@mui/material/Pagination";
import { FaArrowLeftLong } from "react-icons/fa6";
import ShowCardsSearch from "./ShowCardsSearch";

export default function SearchFind({ setGames, games }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const gamesPerPage = 10;
    const pageCount = Math.ceil(games.length / gamesPerPage);

    const paginate = (pageNumber) => { setCurrentPage(pageNumber); };
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

    function Home() { location.reload(); }

    const openGameModal = (game) => {
        setSelectedGame(game);
        setModalVisible(true);
    };

    return (
        <div className="bg-gray-900 flex flex-col items-center mx-4 sm:mx-10 md:mx-20 p-4 sm:p-10 m-4 sm:m-10 relative">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-12">
                {currentGames.map((game) => (
                    <div key={game.gameID} onClick={() => openGameModal(game)} className="game-card w-full p-4 flex flex-col items-center hover:transform hover:scale-105 transition-transform duration-200">
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

            <div className="w-full p-4 bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <button type="button" onClick={Home} className="group inline-flex items-center px-4 py-3 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 transform-gpu min-w-[200px]">
                    <FaArrowLeftLong className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="relative overflow-hidden">
                        <span className="block transition-transform duration-300 group-hover:-translate-y-[110%] text-sm sm:text-base">
                            Back to Home Page
                        </span>
                        <span className="absolute inset-0 block translate-y-[110%] transition-transform duration-300 group-hover:translate-y-0 text-sm sm:text-base">
                            Take Me Back!
                        </span>
                    </span>
                </button>

                <div className="bg-gray-800 p-2 rounded-md shadow-lg w-full sm:w-auto">
                    <Pagination count={pageCount} page={currentPage} onChange={(event, value) => paginate(value)} color="primary" shape="rounded" size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: '#4b5563',
                                    '&:hover': {
                                        backgroundColor: '#374151'
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: '#374151'
                                }
                            }
                        }}/>
                </div>
            </div>

            {modalVisible && (
                <ShowCardsSearch
                    selectedGame={selectedGame}
                    closeModal={() => setModalVisible(false)}
                    modalVisible={modalVisible}
                />
            )}
        </div>
    );
}