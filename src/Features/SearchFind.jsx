import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useT } from "../i18n/index.jsx";

export default function SearchFind({ games }) {
    const { t } = useT();
    const [currentPage, setCurrentPage] = useState(1);

    // A new search must start on page 1, otherwise the old page number can point past the results
    useEffect(() => { setCurrentPage(1); }, [games]);

    const gamesPerPage = 12;
    const pageCount = Math.ceil(games.length / gamesPerPage);

    const paginate = (pageNumber) => { setCurrentPage(pageNumber); };
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

    function Home() { location.reload(); }

    return (
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 sm:py-10">
            <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {currentGames.map((game) => (
                        <Link key={game.id} to={`/searchreview/${game.id}`} className="game-card group flex flex-col h-full">
                            <div className="flex flex-col h-full">
                                <div className="relative pt-[56%] overflow-hidden bg-[#171a22]">
                                    <img src={game.background_image || `https://placehold.co/400x225?text=${encodeURIComponent(game.name)}`} alt={game.name} className="absolute top-0 left-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                                    <div className="absolute top-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">${game.cheapest}</div>
                                    
                                </div>

                                <div className="flex flex-col flex-grow p-3 sm:p-4">
                                    <h3 className="text-sm sm:text-[15px] font-semibold text-white mb-2 line-clamp-2 leading-snug">{game.name}</h3>
                                    <div className="mt-auto">
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {game.platforms?.slice(0, 4).map(platform => (
                                                <span key={platform.platform.id} className="gh-chip !px-1.5 !py-0.5 !text-[10px] sm:!text-[11px]">{platform.platform.name.length > 10 ? platform.platform.name.substring(0, 10) + '...' : platform.platform.name}</span>
                                                
                                            ))}
                                            {game.platforms?.length > 4 && (
                                                <span className="gh-chip !px-1.5 !py-0.5 !text-[10px] sm:!text-[11px]">+{game.platforms.length - 4}</span>
                                            )}
                                        </div>
                                        {/* A nested <a> inside the card <Link> is invalid HTML, so open RAWG from a span */}
                                        <span role="link" tabIndex={0} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://rawg.io/games/${game.slug}`, "_blank", "noopener,noreferrer"); }} className="gh-btn gh-btn-secondary w-full !h-9 !text-xs sm:!text-sm">
                                            {t('search.viewDetails')}
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="w-full flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8">
                <button type="button" onClick={Home} className="group gh-btn gh-btn-secondary !h-11 w-full sm:w-auto">
                    <FaArrowLeftLong className="transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="relative overflow-hidden">
                        <span className="block transition-transform duration-300 group-hover:-translate-y-[110%] text-sm sm:text-base">
                            {t('search.backHome')}
                        </span>
                        <span className="absolute inset-0 block translate-y-[110%] transition-transform duration-300 group-hover:translate-y-0 text-sm sm:text-base">
                            {t('search.takeMeBack')}
                        </span>
                    </span>
                </button>

                <div className="flex justify-center w-full sm:w-auto">
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={(event, value) => paginate(value)}
                        color="primary"
                        shape="rounded"
                        size={typeof window !== 'undefined' && window.innerWidth < 640 ? 'medium' : 'large'}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: '#eceef2', color: '#0a0b0f',
                                    '&:hover': {
                                        backgroundColor: '#ffffff'
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
        </div>
    );
}