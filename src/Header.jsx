import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './body.css'; // Importing the custom CSS
import Search from './Features/Search.jsx';
import { UserContext } from './Features/UserContext.jsx';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { CiLogin } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

export default function Header({ searchTrue, setGames, setSearchTrue, games }) {
    const [allGames, setAllGames] = useState([]);
    const [store, setStore] = useState([]);
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext) || {};
    
    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                setAllGames(data.games);
            } catch (error) {
                console.error("Error:", error);
            }
        }
        fetchFeaturedGames();
    }, []);

    useEffect(() => {
        async function getStores() {
            try {
                const resp = await fetch('https://gamehub-backend-zekj.onrender.com/stores');
                const data = await resp.json();
                setStore(data);
            } catch (error) {
                console.log({ "Fetch error: ": error });
            }
        }
        getStores();
    }, []);

    const [isFavModalOpen, setIsFavModalOpen] = useState(false);
    function openFavModal() {
        setIsFavModalOpen(true);
    }
    function closeFavModal() {
        setIsFavModalOpen(false);
    }

    useEffect(() => {
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user?.uid}`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
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
        window.location.reload();
    }

    return (
        <>
        <header className=" bg-gray-800 text-white p-4 md:p-8">  
            <div className="header-container mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row justify-between items-center">
                <div className="logo-container mb-4 md:mb-0 text-center md:text-left mr-5">
                    <Link to="/">
                        <div className="inline-flex gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold cursor-pointer">Game</h1>
                            <h1 className="text-2xl md:text-3xl font-bold text-sky-500 cursor-pointer">Data</h1>
                            <h1 className="text-2xl md:text-3xl font-bold cursor-pointer">Hub</h1>
                        </div>
                    </Link>
                </div>
                <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                <button className="menu-button text-white text-2xl ml-5 mr-5" onClick={() => setMenuOpen(!menuOpen)}> ☰ </button>
                <nav className={`nav-links w-full xl:flex xl:items-center xl:space-x-4 mt-4 xl:mt-0 ${menuOpen ? "block" : "hidden"}`}>
                    <div className="flex flex-col xl:flex-row xl:space-x-4">
                        <button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto" onClick={() => setStoreVisible(true)}>Stores</button>
                        <a href="#news"><button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto">News</button></a>
                        <Link to="/discover"><button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto">Discover</button></Link>
                        <Link to="/review" ><button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto">Reviews</button></Link>
                    </div>
                </nav>
            <div className="mt-4 xl:mt-0 flex xl:float-right">
                <Link><button className="nav-button text-white px-4 py-2 rounded-lg w-full xl:w-auto" onClick={openFavModal}>Favourites</button></Link>
                {user ? (
                    <Link to="/profile">
                        <button className=" text-white px-4 py-2 rounded-lg w-full xl:w-auto text-lime-600 text-4xl"><CgProfile /></button>
                    </Link>
                ) : (
                    <Link to="/login">
                        <button className="nav-button flex text-white px-4 py-2 rounded-lg w-full xl:w-auto">Login <CiLogin className="ml-1 mt-1" /></button>
                    </Link>
                )}
            </div>
            </div>
        </header>
    
        {/* Modal for Stores */}
        {modalStoreVisible && (
            <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="modal-content text-white p-6 rounded-lg">
                    <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={() => setStoreVisible(false)}>&times;</span>
                    <div className="store overflow-y-auto max-h-96">
                        {store.map((x, i) => (
                            <div key={i}>
                                <p onClick={() => openStoreUrl(x.storeName)} className="store-row">
                                    <span className="storename">{x.storeName}</span>
                                    <img src={`https://www.cheapshark.com${x.images.logo}`} alt={x.storeName} className="store-pic" />
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    
        {/* Modal for Favorites */}
        {isFavModalOpen && (
            <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="modal-content text-white p-6 rounded-lg">
                    <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={closeFavModal}>&times;</span>
                    {favorites.length === 0 ? (
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
    );
}
