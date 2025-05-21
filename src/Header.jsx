import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './Features/UserContext.jsx';
import { CiLogin } from "react-icons/ci";
import { TiDelete } from "react-icons/ti";
import { CgProfile, CgGames } from "react-icons/cg";
import { FaStore, FaNewspaper, FaSearch, FaHeart, FaTimes } from "react-icons/fa";
import { GoStarFill } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import Search from './Features/Search.jsx'; import { MdOutlineRateReview } from "react-icons/md";


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
        if (!user?.uid) return;

        let isMounted = true; 
        const controller = new AbortController();

        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user?.uid}`);
                const data = await resp.json();
                if (isMounted) setFavorites(data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        }
        getFavorites();
        if (user) {
            getFavorites();
            const intervalId = setInterval(getFavorites, 1000);
            return () => clearInterval(intervalId);
        }

        return () => {
            isMounted = false;
            clearInterval(intervalId);
            controller.abort(); 
        };
        
    }, [user, favorites]);

    async function delFav(id) {
        console.log(id)
        const favData = { userId: user.uid };
        const resp = await fetch(
            `https://gamehub-backend-zekj.onrender.com/delfav/${id}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(favData),
            }
        );
    }

    return (
        <>
            <header className="bg-gray-900/80 text-white shadow-lg sticky top-0 z-20">
                <div className="header-container px-4 py-3 place-content-between">
                    <div className="flex items-center justify-between ">
                        <Link to="/" className="flex items-center space-x-2">
                            <CgGames className="text-sky-500 text-3xl" />
                            <motion.div className="flex" whileHover={{ scale: 1.05 }} >
                                <h1 className="text-2xl font-bold">Game</h1>
                                <h1 className="text-2xl font-bold text-sky-500">Data</h1>
                                <h1 className="text-2xl font-bold">Hub</h1>
                            </motion.div>
                        </Link>

                        <div className="hidden md:flex flex-1 mx-8">
                            <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                        </div>

                        <button className="md:hidden text-white text-2xl p-2" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <FaTimes /> : '☰'}
                        </button>

                        <nav className="hidden md:flex items-center space-x-6 float-right">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-gray-300 hover:text-sky-400 transition-colors" onClick={() => setStoreVisible(true)}>
                                <FaStore className="mr-1" /> Stores
                            </motion.button>

                            <a href="#news">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-gray-300 hover:text-sky-400 transition-colors" >
                                    <FaNewspaper className="mr-1" /> News
                                </motion.button>
                            </a>

                            <Link to="/discover">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-gray-300 hover:text-sky-400 transition-colors">
                                    <FaSearch className="mr-1" /> Discover
                                </motion.button>
                            </Link>

                            <Link to="/review">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-gray-300 hover:text-sky-400 transition-colors">
                                    <MdOutlineRateReview  className="mr-1" /> Reviews
                                </motion.button>
                            </Link>


                            {user ? (
                                <>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-sky-400" onClick={openFavModal} >
                                        <GoStarFill size={20} />
                                    </motion.button>

                                    <Link to="/profile">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                            <CgProfile className="text-2xl text-lime-400" />
                                        </motion.div>
                                    </Link>
                                </>
                            ) : (
                                <Link to="/login">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors">  <CiLogin className="mr-1" /> Login
                                    </motion.button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {menuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-4 space-y-3" > <div className="mb-4">
                            <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                        </div>

                            <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg" onClick={() => setStoreVisible(true)} >
                                <FaStore className="mr-2" /> Stores
                            </motion.button>

                            <Link to="#news" className="block">
                                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg" >
                                    <FaNewspaper className="mr-2" /> News
                                </motion.button>
                            </Link>

                            <Link to="/discover" className="block">
                                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg" >
                                    <FaSearch className="mr-2" /> Discover
                                </motion.button>
                            </Link>

                            <Link to="/review" className="block">
                                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg" >
                                    <MdOutlineRateReview className="mr-2" /> Reviews
                                </motion.button>
                            </Link>

                            {user ? (
                                <>
                                    <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg" onClick={openFavModal}>
                                        <GoStarFill className="mr-2 text-sky-400" /> Favorites
                                    </motion.button>

                                    <Link to="/profile" className="block">
                                        <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-gray-800 rounded-lg">
                                            <CgProfile className="mr-2 text-lime-400" /> Profile
                                        </motion.button>
                                    </Link>
                                </>
                            ) : (
                                <Link to="/login" className="block">
                                    <motion.button whileTap={{ scale: 0.95 }} className="flex items-center w-full p-3 bg-sky-600 rounded-lg" >
                                        <CiLogin className="mr-2" /> Login
                                    </motion.button>
                                </Link>
                            )}
                        </motion.div>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {modalStoreVisible && (
                    <motion.div nitial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={() => setStoreVisible(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} > <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-sky-400">Game Stores</h3>
                            <button onClick={() => setStoreVisible(false)} className="text-gray-400 hover:text-white" >
                                <FaTimes size={20} />
                            </button>
                        </div>

                            <div className="grid grid-cols-2 gap-4">
                                {store.map((x, i) => (
                                    <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gray-700 p-4 rounded-lg cursor-pointer text-center" onClick={() => openStoreUrl(x.storeName)} >
                                        <img src={`https://www.cheapshark.com${x.images.logo}`} alt={x.storeName} className="h-12 mx-auto mb-2 object-contain" />
                                        <p className="text-white font-medium">{x.storeName}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFavModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={closeFavModal} >
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-sky-400">Your Favorites</h3>
                                <button onClick={closeFavModal} className="text-gray-400 hover:text-white">
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {favorites.length == 0 ? (
                                <div className="text-center py-8">
                                    <GoStarFill className="mx-auto text-gray-500 text-4xl mb-3" />
                                    <p className="text-gray-400">You don't have any favorite games yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {favorites.map((fav, i) => (
                                        <motion.div key={i} whileHover={{ x: 5 }} className="bg-gray-700 p-4 rounded-lg flex  place-content-between" >
                                            <p className="text-white font-medium  place-content-between">{fav.name}</p>
                                            <TiDelete
                                                className="ml-2 w-5 h-5 cursor-pointer  place-content-between"
                                                onClick={() => delFav(fav.gameId)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}