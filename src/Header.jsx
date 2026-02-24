import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './Features/UserContext.jsx';
import { CiLogin } from "react-icons/ci";
import { TiDelete } from "react-icons/ti";
import { CgProfile, CgGames } from "react-icons/cg";
import { FaStore, FaNewspaper, FaSearch, FaHeart, FaTimes, FaDiscord, FaSteam } from "react-icons/fa";
import { GoStarFill } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import Search from './Features/Search.jsx'; 
import { MdOutlineRateReview } from "react-icons/md";

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

    // Disable body scroll when modal is open
    useEffect(() => {
        if (modalStoreVisible || isFavModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalStoreVisible, isFavModalOpen]);
    function openFavModal() {
        setIsFavModalOpen(true);
    }
    function closeFavModal() {
        setIsFavModalOpen(false);
    }

    useEffect(() => {
        if (!user?.uid) return;

        let isMounted = true;

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
        const intervalId = setInterval(getFavorites, 1000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
        
    }, [user?.uid]);

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
            <header className="bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <CgGames className="text-3xl text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <div className="absolute -inset-1 bg-violet-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <motion.div className="flex items-center" whileHover={{ scale: 1.02 }}>
                                <h1 className="text-2xl font-bold tracking-tight">Game</h1>
                                <h1 className="text-2xl font-bold tracking-tight text-violet-500">Data</h1>
                                <h1 className="text-2xl font-bold tracking-tight">Hub</h1>
                            </motion.div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    
                                </div>
                                <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <FaTimes className="w-6 h-6" /> : <FaDiscord className="w-6 h-6" />}
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-2">
                            <motion.button 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }} 
                                className="flex items-center px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                                onClick={() => setStoreVisible(true)}
                            >
                                <FaStore className="mr-2 text-violet-400" /> 
                                <span>Stores </span>
                            </motion.button>

                                       <Link to="/discover">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }} 
                                    className="flex items-center px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                                >
                                    <FaSearch className="mr-2 text-pink-400" /> 
                                    <span>Discover</span>
                                </motion.button>
                            </Link>

                            <Link to="/review">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }} 
                                    className="flex items-center px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                                >
                                    <MdOutlineRateReview className="mr-2 text-amber-400" /> 
                                    <span>Reviews</span>
                                </motion.button>
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-3 ml-4">
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }} 
                                        whileTap={{ scale: 0.95 }} 
                                        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        onClick={openFavModal}
                                    >
                                        <GoStarFill className="w-5 h-5 text-amber-400" />
                                        {favorites.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] flex items-center justify-center">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </motion.button>

                                    <Link to="/profile">
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }} 
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30"
                                        >
                                            <CgProfile className="w-6 h-6 text-emerald-400" />
                                        </motion.div>
                                    </Link>
                                </div>
                            ) : (
                                <Link to="/login" className="ml-4">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} 
                                        whileTap={{ scale: 0.95 }} 
                                        className="flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all"
                                    >  
                                        <CiLogin className="mr-2" /> 
                                        Login
                                    </motion.button>
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/5 bg-[#030712]/95 backdrop-blur-xl"
                        >
                            <div className="px-4 py-4 space-y-3">
                                {/* Mobile Search */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                                </div>

                                <motion.button 
                                    whileTap={{ scale: 0.95 }} 
                                    className="flex items-center w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    onClick={() => setStoreVisible(true)}
                                >
                                    <FaStore className="mr-3 text-violet-400" /> Stores
                                </motion.button>

                                <Link to="#news" className="block">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }} 
                                        className="flex items-center w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <FaNewspaper className="mr-3 text-cyan-400" /> News
                                    </motion.button>
                                </Link>

                                <Link to="/discover" className="block">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }} 
                                        className="flex items-center w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <FaSearch className="mr-3 text-pink-400" /> Discover
                                    </motion.button>
                                </Link>

                                <Link to="/review" className="block">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }} 
                                        className="flex items-center w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <MdOutlineRateReview className="mr-3 text-amber-400" /> Reviews
                                    </motion.button>
                                </Link>

                                {user ? (
                                    <>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }} 
                                            className="flex items-center w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                            onClick={openFavModal}
                                        >
                                            <GoStarFill className="mr-3 text-amber-400" /> 
                                            Favorites ({favorites.length})
                                        </motion.button>

                                        <Link to="/profile" className="block">
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }} 
                                                className="flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20"
                                            >
                                                <CgProfile className="mr-3 text-emerald-400" /> Profile
                                            </motion.button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/login" className="block">
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }} 
                                            className="flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold"
                                        >
                                            <CiLogin className="mr-3" /> Login
                                        </motion.button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

                            {/* Stores Modal */}
                            <AnimatePresence>
                {modalStoreVisible && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                        onClick={() => setStoreVisible(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                            animate={{ scale: 1, y: 0, opacity: 1 }} 
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden border border-violet-500/20 shadow-2xl shadow-violet-500/10 custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        > 
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl">
                                        <FaStore className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            Game Stores
                                        </h3>
                                        <p className="text-gray-400 text-sm">Find the best deals on your favorite games</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setStoreVisible(false)} 
                                    className="p-3 rounded-xl bg-white/5 hover:bg-violet-500/20 transition-all border border-white/10 hover:border-violet-500/30"
                                >
                                    <FaTimes className="w-6 h-6 text-gray-300" />
                                </button>
                            </div>

                            {/* Featured Stores */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Popular Stores</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {store.slice(0, 8).map((x, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ scale: 1.05, y: -4 }} 
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 hover:from-violet-500/20 hover:to-cyan-500/20 p-4 rounded-2xl cursor-pointer border border-violet-500/20 hover:border-violet-500/50 transition-all group"
                                            onClick={() => openStoreUrl(x.storeName, store)}
                                        >
                                            <div className="relative mb-3">
                                                <img   
                                                    loading="lazy"  
                                                    src={`https://www.cheapshark.com${x.images.logo}`} 
                                                    alt={x.storeName} 
                                                    className="h-14 mx-auto object-contain" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg blur-lg"></div>
                                            </div>
                                            <p className="text-white font-semibold text-center text-sm">{x.storeName}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* All Stores */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">All Stores</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {store.slice(8).map((x, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ scale: 1.05, y: -2 }} 
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl cursor-pointer text-center border border-white/5 hover:border-violet-500/30 transition-all"
                                            onClick={() => openStoreUrl(x.storeName, store)}
                                        >
                                            <img   
                                                loading="lazy"  
                                                src={`https://www.cheapshark.com${x.images.logo}`} 
                                                alt={x.storeName} 
                                                className="h-10 mx-auto mb-2 object-contain" 
                                            />
                                            <p className="text-gray-300 font-medium text-xs truncate">{x.storeName}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-center text-gray-500 text-sm">
                                    Click on any store to visit their website and find amazing game deals! 🎮
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Favorites Modal */}
            <AnimatePresence>
                {isFavModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                        onClick={closeFavModal}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                            animate={{ scale: 1, y: 0, opacity: 1 }} 
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                    Your Favorites
                                </h3>
                                <button 
                                    onClick={closeFavModal} 
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {favorites.length === 0 ? (
                                <div className="text-center py-12">
                                    <GoStarFill className="mx-auto text-gray-600 text-5xl mb-4" />
                                    <p className="text-gray-400">You don't have any favorite games yet.</p>
                                    <p className="text-gray-500 text-sm mt-2">Click the star icon on any game to add it!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {favorites.map((fav, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ x: 5 }}
                                            className="bg-white/5 p-4 rounded-xl flex items-center justify-between group"
                                        >
                                            <span className="text-white font-medium truncate pr-4">{fav.name}</span>
                                            <TiDelete
                                                className="w-5 h-5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
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

function openStoreUrl(storeName, storeData) {
    const storeUrls = {
        'Steam': 'https://store.steampowered.com',
        'GOG': 'https://www.gog.com',
        'Epic Games Store': 'https://store.epicgames.com',
        'Origin': 'https://www.origin.com',
        'Uplay': 'https://www.ubisoft.com',
        'Battle.net': 'https://www.blizzard.com',
        'Microsoft Store': 'https://www.xbox.com',
        'Humble Bundle': 'https://www.humblebundle.com',
        'GreenManGaming': 'https://www.greenmangaming.com',
        'Amazon Games': 'https://www.amazon.com/gaming',
        'GameStop': 'https://www.gamestop.com',
        'Best Buy': 'https://www.bestbuy.com',
        'Itch.io': 'https://itch.io',
        'Kongregate': 'https://www.kongregate.com',
        'Newegg': 'https://www.newegg.com',
    };
    
    if (storeUrls[storeName]) {
        window.open(storeUrls[storeName], '_blank');
    } else {
        // Fallback to CheapShark for other stores
        const storeItem = storeData?.find(s => s.storeName === storeName);
        const storeId = storeItem?.storeID || 1;
        window.open(`https://www.cheapshark.com/redirect?storeID=${storeId}`, '_blank');
    }
}
