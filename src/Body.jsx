import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Rotate from "./Rotate.jsx"
import ShowCards from './ShowCards.jsx';
import FeaturedGames from './FeaturedGames.jsx';
import Search from './Search.jsx';
import SearchFind from './SearchFind.jsx';
import MainSection from './MainSection.jsx';
import StoresFooter from './StoresFooter.jsx';
import Free from './Free.jsx';
import Loot from './Loot.jsx';
import News from './News.jsx';
import Live from './Live.jsx';
import StartUp from './StartUp.jsx';
import Discounted from './Discounted.jsx';
import "tailwindcss";
import { UserContext } from './UserContext.jsx';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import Mobile from './Mobile.jsx';
import Footer from './Footer.jsx';
import { CiLogin } from "react-icons/ci";

export default function Body() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [rating, setRatings] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [store, setStore] = useState([])
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [searchTrue, setSearchTrue] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const name = "";

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                setAllGames(data.games); // Access games 
            } catch (error) {
                console.error("Error:", error);
            }
        }
        fetchFeaturedGames();
    }, []);


    useEffect(() => {
        if (allGames.length > 0) {
            categorizeGames();
        } setStoreVisible(false)
    }, [allGames]);


    function categorizeGames() {
        setMultiplayerGames(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("multiplayer"))));
        setActionGames(allGames.filter(game => game.genres?.some(genre => genre.name.toLowerCase().includes("action"))));
        setScifi(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("sci-fi"))));
        setExplore(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("exploration"))));
    }


    function showGameDetails(game) {
        const requirements = game.platforms?.map(p => p.requirements_en?.minimum).join(", ");
        setSelectedGame({ ...game, requirements });
        setModalVisible(true);
    }


    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    function ref() {
        window.location.reload();
    }
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
    function stores() {
        setStoreVisible(true)
        //console.log(store)
    }
    function closeStore() { setStoreVisible(false) }

    function openStoreUrl(name) {
        console.log(name);

        let url = "";

        if (name.toLowerCase() == 'steam') {
            url = 'store.steampowered.com/';
        } else if (name.toLowerCase() == 'getgamez') {
            url = 'getgamez.net/';
        } else if (name.toLowerCase() == 'playfield') {
            url = 'www.playitstore.hu/';
        } else if (name.toLowerCase() == 'imperial games') {
            url = 'imperial.games/';
        } else if (name.toLowerCase() == 'funstockdigital') {
            url = 'funstock.eu';
        } else if (name.toLowerCase() == 'razer game store') {
            url = 'www.razer.com/eu-en/store';
        } else {
            url = `${name.toLowerCase().replace(/\s+/g, '')}.com`; //itt Bence te a store.storeName.toLowerCase-t tetted... XDD
        }

        window.open(`https://${url}`, '_blank');
    }

    const [isFavModalOpen, setIsFavModalOpen] = useState(false);

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

    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
           {/*{!isLoaded && <StartUp onLoaded={() => setIsLoaded(true)} />} {isLoaded && (*/}
                <div className=''>
                    <header className="p-4 bg-gray-800 flex flex-wrap justify-between items-center">
                        <div className="head flex items-center justify-between w-full md:w-auto">
                            <h1 className="text-2xl md:text-3xl font-bold text-white cursor-pointer" onClick={ref}> Game Data Hub</h1>
                            <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}> ☰ </button>
                        <nav className={`w-full md:flex md:items-center md:space-x-4 ${menuOpen ? "block" : "hidden"}`}>
                            <div className="flex flex-col md:flex-row md:space-x-4">
                                <button className="nav-button text-white px-4 py-2 rounded-lg w-full md:w-auto" onClick={stores}> Stores</button>
                                <button className="nav-button text-white px-4 py-2 rounded-lg w-full md:w-auto" onClick={openFavModal}>   Favourites </button>
                                <Link to="/discover"><button className="nav-button text-white px-4 py-2 rounded-lg w-full md:w-auto">Discover </button>  </Link>
                                {user ? ( <button onClick={handleLogout} className="nav-button text-white px-4 py-2 rounded-lg w-full md:w-auto text-lime-600"> <p className='text-lime-600'>LogOut</p> </button>
                                ) : (
                                    <Link to="/login"> <button className="nav-button flex flex-wrap text-white px-4 py-2 rounded-lg w-full md:w-auto">Login <span className='mt-2 mb-1 ml-1'><CiLogin /></span> </button></Link>
                                )}
                            </div>
                        </nav>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-center md:justify-end">
                            <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                        </div>
                    </header>

                    {searchTrue == false ? (
                        <div className="main-content flex h-screen ">
                            <div className='allSections'>
                                <MainSection allGames={allGames} showGameDetails={showGameDetails} />
                                <FeaturedGames allGames={allGames} showGameDetails={showGameDetails} />
                                <Free />
                                <Rotate games={multiplayerGames} showGameDetails={showGameDetails} name={"Multiplayer games"} />
                                <Rotate games={actionGames} showGameDetails={showGameDetails} name={"Action games"} />
                                <Discounted />
                                <Rotate games={scifi} showGameDetails={showGameDetails} name={"Sci-fi games"} />
                                <Mobile />
                                <Rotate games={exploration} showGameDetails={showGameDetails} name={"Exploration games"} />
                                <News />
                                
                                <Loot />
                              
                                <StoresFooter />
                                
                            </div>
                            <Footer />
                        </div>
                    ) : <div className='rights '> <SearchFind games={games} setGames={setGames} /> </div>}

                    <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />

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
                  
                </div>
                
            {/*)}*/}
        </>
    );
}
