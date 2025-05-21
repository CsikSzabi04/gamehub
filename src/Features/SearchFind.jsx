import { useState } from "react";
import Pagination from "@mui/material/Pagination";
import { FaArrowLeftLong } from "react-icons/fa6";
import ShowCardsSearch from "./ShowCardsSearch";
import { Link } from "react-router-dom";

export default function SearchFind({ setGames, games }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const gamesPerPage = 12;
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
        <div className=" flex flex-col items-center mx-4 sm:mx-10 md:mx-20 p-4 sm:p-10 m-4 sm:m-10 relative">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-8">
                    {currentGames.map((game) => (
                        <Link to={`/searchreview/${game.id}`} className="group relative flex flex-col h-full bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div key={game.id} onClick={() => openGameModal(game)} className="group relative flex flex-col h-full bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative pt-[56%] overflow-hidden">
                                    <img src={game.background_image || `https://via.placeholder.com/400x225?text=${encodeURIComponent(game.name)}`} alt={game.name} className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    <div className="absolute top-2 right-2 bg-green-600/90 text-white text-sm font-bold px-2 py-1 rounded-md backdrop-blur-sm">${game.cheapest}</div>
                                    
                                </div>

                                <div className="flex flex-col flex-grow p-4">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{game.name}</h3>
                                    <div className="mt-auto">
                                        <div className="flex flex-wrap gap-1 mb-3 justify-center">
                                            {game.platforms?.slice(0, 4).map(platform => (
                                                <span key={platform.platform.id} className="text-xs bg-gray-700/80 text-gray-200 px-2 py-1 rounded whitespace-nowrap" >{platform.platform.name.length > 10 ? platform.platform.name.substring(0, 10) + '...' : platform.platform.name}</span>
                                                
                                            ))}
                                            {game.platforms?.length > 4 && (
                                                <span className="text-xs bg-gray-700/80 text-gray-200 px-2 py-1 rounded">+{game.platforms.length - 4}</span>
                                            )}
                                        </div>
                                        <a href={`https://rawg.io/games/${game.slug}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-full inline-flex items-center justify-center bg-blue-900 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200"  >
                                            View Details
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="w-full p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
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

                <div className=" p-2 rounded-md shadow-lg w-full sm:w-auto">
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={(event, value) => paginate(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
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
                        }}
                    />
                </div>
            </div>
            {modalVisible && (<ShowCardsSearch selectedGame={selectedGame} closeModal={() => setModalVisible(false)} modalVisible={modalVisible} />)}
        </div>
    );
}