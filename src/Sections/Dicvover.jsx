import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Search from "../Features/Search.jsx";
import SearchFind from "../Features/SearchFind.jsx";
import Stores from "../Stores/Stores.jsx";
import Pagination from '@mui/material/Pagination';
import '../body.css';
import { useContext } from "react";
import { UserContext } from '../Features/UserContext.jsx';
import { CiLogin } from "react-icons/ci";
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import News from "./News.jsx";
import UnderMain from './UnderMain.jsx';

export default function Discover() {
    const [allGames, setAllGames] = useState([]);
    const [games, setGames] = useState([]);
    const [modalStoreVisible, setStoreVisible] = useState(false);

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                if (data.games && Array.isArray(data.games)) {
                    setAllGames(data.games); // Access games
                }
            } catch (error) {
                console.error("Error fetching featured games:", error);
            }
        }
        fetchFeaturedGames();
    }, []);

    const [gamesFree, setGamesFree] = useState([]);
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
            }
        }
        fetchGames();
    }, []);


    // Paginate from MUI
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 20;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const currentGames = gamesFree.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);
    const pageCount = Math.ceil(gamesFree.length / gamesPerPage);

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
                                <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
                                <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {Array.isArray(allGames) && allGames.length > 0 ? (
                                        allGames.map((game) => (
                                            <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer">
                                                <img src={game.background_image} alt={game.name} className="game-image" />
                                                <div className="game-details">
                                                    <h3 className="text-lg font-bold mb-2 ">{game.name}</h3>
                                                    <div className="flex-grow"></div>
                                                    <div className="float-start"><p className="text-sm text-gray-400">Rating: {game.rating}/5</p></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<p className="text-white">No games found. :(</p>)}
                                </div>
                            </section>
                        </div>
                    </div>
                    <News />
                    <div className="p-4 bg-gray-900">
                        <section id="featured-games" className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-white">All Free Games</h2>
                            <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {currentGames.length > 0 ? (
                                    currentGames.map((game) => (
                                        <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer">
                                            <img src={game.thumbnail} alt={game.title} className="game-image" />
                                            <div className="game-details">
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
                        </section>
                    </div>

                    <div className="p-4 bg-gray-900 text-white">
                        <div className="flex justify-center bg-gray-800 text-white ">
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
            ) : <div className='rights '> <SearchFind games={games} setGames={setGames} /> </div>}

            {modalStoreVisible && (
                <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="modal-content text-white p-6 rounded-lg">
                        <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={closeStore} >&times; </span>
                        <div className="store overflow-y-auto max-h-96">
                            {store.map((x, i) => <div key={i}><p onClick={() => openStoreUrl(x.storeName)} className='store-row'> <span className='storename'>{x.storeName}</span>  <img src={`https://www.cheapshark.com${x.images.logo}`} alt={x.storeName} className="store-pic" /></p></div>)}
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
