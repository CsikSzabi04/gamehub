import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Search from './Features/Search.jsx';
import "tailwindcss";
import { UserContext } from './Features/UserContext.jsx';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { CiLogin } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import Profile from './pages/Profile.jsx';

export default function Header({searchTrue, setGames ,setSearchTrue, games}) {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [rating, setRatings] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    
    const [store, setStore] = useState([])
    const [modalStoreVisible, setStoreVisible] = useState(false);
  
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
            const intervalId = setInterval(getFavorites, 100);
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
        window.location.reload();
    };

    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
            <header className="bg-gray-800 text-white p-4 md:p-8 ">
                <div className="mx-auto px-6 md:px-12 w-full f">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start float-left">
                        <div className="mb-4 md:mb-0 text-center md:text-left mr-5">
                            <Link to="/">
                                <div className="inline-flex gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold cursor-pointer">Game</h1>
                                    <h1 className="text-2xl md:text-3xl font-bold text-sky-500 cursor-pointer">Data</h1>
                                    <h1 className="text-2xl md:text-3xl font-bold cursor-pointer">Hub</h1>
                                </div>
                            </Link>
                        </div>
                        <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                        <button className="xl:hidden text-white text-2xl ml-5 mr-5" onClick={() => setMenuOpen(!menuOpen)}> ☰</button>
                        <nav className={`w-full xl:flex xl:items-center xl:space-x-4 mt-4 xl:mt-0 ${menuOpen ? "block" : "hidden"}`}>
                            <div className="flex flex-col xl:flex-row xl:space-x-4">
                                <button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto" onClick={stores}>Stores </button>
                                 <a href="#news"> <button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto">News</button> </a>
                                <Link to="/discover"> <button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto">Discover</button> </Link>
                            </div>
                        </nav>
                    </div>
                    <div className="mt-4 xl:mt-0 flex flex-wrap justify-center xl:justify-end f">
                        <button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto" onClick={openFavModal}> Favourites </button>
                        {user ? (
                           <Link to="/profile"><button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto text-lime-600 text-4xl"> <p className="text-lime-600 text-4xl"> <CgProfile /></p></button></Link> 
                        ) : (
                            <Link to="/login"><button className="nav-button flex flex-wrap text-white px-4 py-2 rounded-lg w-full xl:w-auto"> Login <span className="mt-2 mb-1 ml-1"><CiLogin /></span> </button></Link>
                        )}
                    </div>
                </div>
            </header>


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
        </>
    )
}