import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Search from "../Features/Search.jsx";
import SearchFind from "../Features/SearchFind.jsx";
import Stores from "../Stores/Stores.jsx";
import '../body.css';
import { useContext } from "react";
import { UserContext } from '../Features/UserContext.jsx';
import { CiLogin } from "react-icons/ci";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import News from "./News.jsx";
import UnderMain from './UnderMain.jsx';
import LazyImage from "../Components/LazyImage.jsx";
import { motion } from 'framer-motion';

export default function Discover() {
    const [allGames, setAllGames] = useState([]);
    const [games, setGames] = useState([]);
    const [gamesFree, setGamesFree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFree, setIsLoadingFree] = useState(true);
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                if (data.games && Array.isArray(data.games)) {
                    setAllGames(data.games);
                }
            } catch (error) {
                console.error("Error fetching featured games:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchFeaturedGames();
    }, []);

    useEffect(() => {
        async function fetchGames() {
            try {
                const response = await fetch("https://gamehub-backend-zekj.onrender.com/free");
                const data = await response.json();
                const gamesData = data.map((game) => ({
                    id: game.id,
                    title: game.title,
                    thumbnail: game.thumbnail,
                    short_description: game.short_description,
                    game_url: game.game_url,
                    genre: game.genre,
                    platform: game.platform,
                    publisher: game.publisher,
                    developer: game.developer,
                    release_date: game.release_date,
                    freetogame_profile_url: game.freetogame_profile_url,
                }));
                setGamesFree(gamesData);
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setIsLoadingFree(false);
            }
        }
        fetchGames();
    }, []);


    // Paginate from MUI
    const [currentPage, setCurrentPage] = useState(1);
    const [featuredPage, setFeaturedPage] = useState(1);
    const gamesPerPage = 12;
    const featuredGamesPerPage = 10;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const paginateFeatured = (pageNumber) => setFeaturedPage(pageNumber);
    const currentGames = gamesFree.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);
    const pageCount = Math.ceil(gamesFree.length / gamesPerPage);
    const featuredPageCount = Math.ceil(allGames.length / featuredGamesPerPage);
    const currentFeaturedGames = allGames.slice((featuredPage - 1) * featuredGamesPerPage, featuredPage * featuredGamesPerPage);

    function ref() {
        window.location.reload();
    }
    const [menuOpen, setMenuOpen] = useState(false);
    function stores() {
        setStoreVisible(true)
        //console.log(store)
    }


    function openFavModal() {
        console.log('Opening favorites modal');
        setIsFavModalOpen(true);
    };

    function closeFavModal() {
        console.log('Closing favorites modal');
        setIsFavModalOpen(false);
    };
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext);

    function handleLogout() {
        signOut(auth);
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
                setError("Error fetching favorites");
                console.error("Error fetching favorites:", error);
            }
        }
        getFavorites();
    };
    const [searchTrue, setSearchTrue] = useState(false);

    const [store, setStore] = useState([])

    useEffect(() => {
        async function getStores() {
            try {
                const resp = await fetch('https://gamehub-backend-zekj.onrender.com/stores');
                const data = await resp.json();
                setStore(data)
            } catch (error) { console.log({ "Fetch error: ": error }) }
        }
        getStores()
    }, [])
    function closeStore() { setStoreVisible(false) }

    useEffect(() => {
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
                setError("Error fetching favorites");
                console.error("Error fetching favorites:", error);
            }
        }
        if (user) {
            getFavorites();
            const intervalId = setInterval(getFavorites, 1000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    function handleLogout() {
        signOut(auth);
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
                setError("Error fetching favorites");
                console.error("Error fetching favorites:", error);
            }
        }
        getFavorites();
    };

    const [isFavModalOpen, setIsFavModalOpen] = useState(false);

    function openFavModal() {
        console.log('Opening favorites modal');
        setIsFavModalOpen(true);
    };

    function closeFavModal() {
        console.log('Closing favorites modal');
        setIsFavModalOpen(false);
    };
    
    function showGameDetails(game) {
        const requirements = game.platforms?.map(p => p.requirements_en?.minimum).join(", ");
        setSelectedGame({ ...game, requirements });
        setModalVisible(true);
    }

    return (
        <div>
            <Stores modalStoreVisible={modalStoreVisible} />
            <Header />
            <UnderMain allGames={allGames} showGameDetails={showGameDetails}/>
            {searchTrue == false ? (
                <div className="pl-20 pr-20">
                    <div className=" bg-gray-900 ">
                        <div className=" mx-auto p-4">
                            <section id="featured-games" className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Featured Games</h2>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : (
                                    <>
                                        <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {Array.isArray(currentFeaturedGames) && currentFeaturedGames.length > 0 ? (
                                                currentFeaturedGames.map((game) => (
                                                    <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer group">
                                                <LazyImage src={game.background_image} alt={game.name} className="game-image" />
                                                        <div className="game-details group-hover:from-black">
                                                            <h3 className="text-lg font-bold mb-2 text-white">{game.name}</h3>
                                                            <div className="flex-grow"></div>
                                                            <div className="float-start"><p className="text-sm text-gray-400">Rating: {game.rating}/5</p></div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (<p className="text-white">No games found. :(</p>)}
                                        </div>
                                        {featuredPageCount > 1 && (
                                            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                                                <button
                                                    onClick={() => paginateFeatured(featuredPage - 1)}
                                                    disabled={featuredPage === 1}
                                                    className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    ←
                                                </button>
                                                
                                                {Array.from({ length: Math.min(5, featuredPageCount) }, (_, i) => {
                                                    let pageNum;
                                                    if (featuredPageCount <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (featuredPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (featuredPage >= featuredPageCount - 2) {
                                                        pageNum = featuredPageCount - 4 + i;
                                                    } else {
                                                        pageNum = featuredPage - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => paginateFeatured(pageNum)}
                                                            className={`px-3 py-2 rounded-lg transition-colors ${
                                                                featuredPage === pageNum
                                                                    ? 'bg-violet-600 text-white'
                                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                                
                                                {featuredPageCount > 5 && featuredPage < featuredPageCount - 2 && (
                                                    <>
                                                        <span className="text-gray-500">...</span>
                                                        <button
                                                            onClick={() => paginateFeatured(featuredPageCount)}
                                                            className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                                        >
                                                            {featuredPageCount}
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => paginateFeatured(featuredPage + 1)}
                                                    disabled={featuredPage === featuredPageCount}
                                                    className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </section>
                        </div>
                    </div>
                    <News />
                    <div className="p-4 bg-gray-900">
                        <section id="free-games" className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-white">All Free Games</h2>
                            {isLoadingFree ? (
                                <div className="flex justify-center items-center py-20">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
                                </div>
                            ) : (
                                <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {currentGames.length > 0 ? (
                                        currentGames.map((game) => (
                                            <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer group">
                                                <LazyImage src={game.thumbnail} alt={game.title} className="game-image" />
                                                <div className="game-details group-hover:from-black">
                                                    <h3 className="text-lg font-bold text-white">{game.title}</h3>
                                                    <div className="platforms text-sm text-gray-600">
                                                        <div className="flex-grow"></div>
                                                        <div className="float-start">
                                                            <span className="font-semibold">Platform:</span> {game.platform}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<p className="text-white">No games found.</p>)}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Custom Pagination */}
                    <div className="p-4 bg-gray-900 text-white">
                        <div className="flex flex-wrap justify-center items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ←
                            </button>
                            
                            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                                let pageNum;
                                if (pageCount <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= pageCount - 2) {
                                    pageNum = pageCount - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            {pageCount > 5 && currentPage < pageCount - 2 && (
                                <>
                                    <span className="text-gray-500">...</span>
                                    <button
                                        onClick={() => paginate(pageCount)}
                                        className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                    >
                                        {pageCount}
                                    </button>
                                </>
                            )}
                            
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === pageCount}
                                className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            ) : <div className='rights '> <SearchFind games={games} setGames={setGames} /> </div>}

            {modalStoreVisible && (
                <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="modal-content text-white p-6 rounded-lg">
                        <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={closeStore} >&times; </span>
                        <div className="store overflow-y-auto max-h-96">
                            {store.map((x, i) => <div key={i}><p onClick={() => openStoreUrl(x.storeName)} className='store-row'> <span className='storename'>{x.storeName}</span>  <img src={`https://www.cheapshark.com${x.images.logo}`} alt={x.storeName} className="store-pic" loading="lazy" /></p></div>)}
                        </div>
                    </div>
                </div>
            )}

            {isFavModalOpen && (
                <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="modal-content text-white p-6 rounded-lg">
                        <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={closeFavModal}>&times;</span>
                        {favorites.length == 0 ? (
                            <p className="text-white">You don't have any favorite games yet.</p>
                        ) : (
                            <div className="store overflow-y-auto max-h-96">
                                {favorites.map((fav, i) => (
                                    <div key={i} className="store-row fav-card bg-gray-800 p-4 rounded-md mb-4">
                                        <p className="storename text-white mt-2">{fav.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <Footer />
        </div>
    );
}
