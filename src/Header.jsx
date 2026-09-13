import React, { useEffect, useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserContext } from './Features/UserContext.jsx';
import { CgGames } from "react-icons/cg";
import { BsShop, BsCompass, BsChatSquareText, BsStarFill, BsStar, BsX, BsList, BsTrash3, BsBoxArrowUpRight, BsSearch, BsGrid } from "react-icons/bs";
import { AnimatePresence, motion } from 'framer-motion';
import Search from './Features/Search.jsx';
import { cachedFetch } from './Components/apiCache.js';
import { STORE_GROUPS, countCatalogueGames } from './Components/storeDirectory.js';
import UserAvatar from './Components/profile/UserAvatar.jsx';

// Icon-only on tablets (md), icon + label from lg so the search field keeps its width
const navItemClass = "inline-flex items-center justify-center gap-2 h-9 min-w-9 px-2.5 lg:px-3 rounded-lg text-sm font-medium transition-colors";
const navIdle = "text-[#a1a6b3] hover:text-white hover:bg-white/[0.05]";
const navActive = "text-white bg-white/[0.07]";

function ModalShell({ onClose, title, subtitle, maxWidth = 'max-w-md', children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/75 flex justify-center items-end sm:items-center z-[200] p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className={`bg-[#111319] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full ${maxWidth} max-h-[88svh] sm:max-h-[85vh] flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom)]`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/[0.06]">
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        {subtitle && <p className="text-sm mt-0.5">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="-mr-2 p-1.5 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                        <BsX className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto overscroll-contain custom-scrollbar px-4 sm:px-6 py-4 sm:py-5">{children}</div>
            </motion.div>
        </motion.div>
    );
}

export default function Header({ setGames, setSearchTrue, games }) {
    const [storeCounts, setStoreCounts] = useState({});
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext) || {};

    // Store list is static; the catalogue is only loaded (from cache) when the modal opens, for the game counts
    useEffect(() => {
        if (!modalStoreVisible) return;
        let cancelled = false;
        cachedFetch('https://gamehub-backend-zekj.onrender.com/fetch-games')
            .then(data => { if (!cancelled) setStoreCounts(countCatalogueGames(data?.games)); })
            .catch(error => console.error("Error loading catalogue for store counts:", error));
        return () => { cancelled = true; };
    }, [modalStoreVisible]);

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
        setMenuOpen(false);
        setIsFavModalOpen(true);
    }
    function closeFavModal() {
        setIsFavModalOpen(false);
    }
    function openStores() {
        setMenuOpen(false);
        setStoreVisible(true);
    }

    useEffect(() => {
        if (!user?.uid) {
            setFavorites([]);
            return;
        }

        let isMounted = true;

        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user?.uid}`);
                const data = await resp.json();
                if (isMounted) setFavorites(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        }

        getFavorites();
        const intervalId = setInterval(getFavorites, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };

    }, [user?.uid]);

    async function delFav(id) {
        if (!user?.uid) return;
        const favData = { userId: user.uid };
        try {
            const resp = await fetch(
                `https://gamehub-backend-zekj.onrender.com/delfav/${id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(favData),
                }
            );
            if (resp.ok) {
                setFavorites(prev => prev.filter(fav => fav.gameId !== id));
            }
        } catch (error) {
            console.error("Error deleting favorite:", error);
        }
    }

    return (
        <>
            <header className="sticky top-0 z-[100]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3 md:gap-4 lg:gap-6 h-14 sm:h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                            <CgGames className="text-[26px] sm:text-[28px] text-[#8b5cf6]" />
                            <span className="gh-logo text-lg sm:text-xl font-extrabold tracking-tight text-white">
                                Game<span className="text-[#8b5cf6]">Data</span>Hub
                            </span>
                        </Link>

                        {/* Search - Desktop */}
                        <div className="hidden md:block flex-1 min-w-0 max-w-md">
                            <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-shrink-0" aria-label="Main">
                            <button className={`${navItemClass} ${navIdle}`} onClick={openStores} title="Stores">
                                <BsShop />
                                <span className="hidden lg:inline">Stores</span>
                            </button>
                            <NavLink to="/discover" className={({ isActive }) => `${navItemClass} ${isActive ? navActive : navIdle}`} title="Discover">
                                <BsCompass />
                                <span className="hidden lg:inline">Discover</span>
                            </NavLink>
                            <NavLink to="/hub" className={({ isActive }) => `${navItemClass} ${isActive ? navActive : navIdle}`} title="Hub">
                                <BsGrid />
                                <span className="hidden lg:inline">Hub</span>
                            </NavLink>
                            <NavLink to="/review" className={({ isActive }) => `${navItemClass} ${isActive ? navActive : navIdle}`} title="Reviews">
                                <BsChatSquareText />
                                <span className="hidden lg:inline">Reviews</span>
                            </NavLink>

                            <span className="mx-1.5 lg:mx-2 h-6 w-px bg-white/[0.08]" />

                            {user ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.05] transition-colors"
                                        onClick={openFavModal}
                                        aria-label="Favorites"
                                        title="Favorites"
                                    >
                                        {favorites.length > 0 ? <BsStarFill className="w-[18px] h-[18px] text-amber-400" /> : <BsStar className="w-[18px] h-[18px]" />}
                                        {favorites.length > 0 && (
                                            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#eceef2] text-[#0a0b0f] text-[10px] font-bold leading-4 text-center">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </button>

                                    <NavLink
                                        to="/profile"
                                        title={user.email}
                                        className={({ isActive }) => `inline-flex items-center justify-center h-9 w-9 overflow-hidden rounded-full bg-[#1e222c] text-sm font-semibold text-[#c4b5fd] transition-shadow ${isActive ? 'ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#0a0b0f]' : 'hover:ring-2 hover:ring-white/20'}`}
                                    >
                                        <UserAvatar className="h-full w-full" />
                                    </NavLink>
                                </div>
                            ) : (
                                <Link to="/login" className="gh-btn gh-btn-primary !h-9">
                                    Log in
                                </Link>
                            )}
                        </nav>

                        {/* Mobile: search shortcut + menu toggle (the search field lives at the top of the menu) */}
                        <div className="md:hidden flex items-center gap-1 -mr-2">
                        {!menuOpen && (
                            <button
                                className="p-2.5 rounded-lg text-[#c9ccd4] hover:bg-white/[0.06] transition-colors"
                                onClick={() => setMenuOpen(true)}
                                aria-label="Search games"
                            >
                                <BsSearch className="w-[18px] h-[18px]" />
                            </button>
                        )}
                        <button
                            className="p-2 rounded-lg text-[#c9ccd4] hover:bg-white/[0.06] transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {menuOpen ? <BsX className="w-6 h-6" /> : <BsList className="w-6 h-6" />}
                        </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-white/[0.06] bg-[#0a0b0f] max-h-[calc(100svh-3.5rem)] overflow-y-auto overscroll-contain">
                        <div className="px-4 pt-4 pb-6 space-y-1">
                            <div className="mb-3">
                                <Search games={games} setGames={setGames} setSearchTrue={setSearchTrue} />
                            </div>

                            <button className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]" onClick={openStores}>
                                <BsShop className="text-[#6b7080]" /> Stores
                            </button>
                            <Link to="/discover" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                <BsCompass className="text-[#6b7080]" /> Discover
                            </Link>
                            <Link to="/hub" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                <BsGrid className="text-[#6b7080]" /> Hub
                            </Link>
                            <Link to="/review" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                <BsChatSquareText className="text-[#6b7080]" /> Reviews
                            </Link>

                            <div className="pt-3 mt-2 border-t border-white/[0.06]">
                                {user ? (
                                    <>
                                        <button className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]" onClick={openFavModal}>
                                            <BsStar className="text-[#6b7080]" />
                                            Favorites
                                            <span className="ml-auto text-xs text-[#6b7080]">{favorites.length}</span>
                                        </button>
                                        <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                            <UserAvatar className="h-6 w-6 bg-[#1e222c] text-xs font-semibold text-[#c4b5fd]" />
                                            Profile
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/login" className="gh-btn gh-btn-primary w-full">Log in</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Stores Modal */}
            <AnimatePresence>
                {modalStoreVisible && (
                    <ModalShell
                        onClose={() => setStoreVisible(false)}
                        title="Game stores"
                        subtitle="Where to buy or download the games you find on GameDataHub."
                        maxWidth="max-w-3xl"
                    >
                        <div className="space-y-6">
                            {STORE_GROUPS.map(group => (
                                <div key={group.id}>
                                    <h4 className="gh-eyebrow mb-2.5">{group.title}</h4>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {group.stores.map(shop => {
                                            const Icon = shop.icon;
                                            const count = storeCounts[shop.id];
                                            return (
                                                <li key={shop.id}>
                                                    <a
                                                        href={shop.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-3 p-3 rounded-xl bg-[#171a22] border border-white/[0.06] hover:border-white/[0.16] hover:bg-[#1e222c] transition-colors"
                                                    >
                                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0a0b0f] text-[#d4d7de] group-hover:text-white">
                                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-white truncate">{shop.name}</span>
                                                                {count > 0 && (
                                                                    <span className="flex-shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-[#c9ccd4]">
                                                                        {count} {count === 1 ? 'game' : 'games'}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="block text-xs text-[#8a8f9c] truncate">{shop.mentioned}</span>
                                                        </span>
                                                        <BsBoxArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-[#6b7080] group-hover:text-white transition-colors" aria-hidden="true" />
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-xs text-[#6b7080]">
                            Game counts come from the GameDataHub catalogue. Links open the official store in a new tab.
                        </p>
                    </ModalShell>
                )}
            </AnimatePresence>

            {/* Favorites Modal */}
            <AnimatePresence>
                {isFavModalOpen && (
                    <ModalShell onClose={closeFavModal} title="Favorites" subtitle={favorites.length ? `${favorites.length} saved ${favorites.length === 1 ? 'game' : 'games'}` : null}>
                        {favorites.length === 0 ? (
                            <div className="text-center py-10">
                                <BsStar className="mx-auto text-[#3a3f4b] text-3xl mb-4" />
                                <p className="text-sm text-[#a1a6b3]">You don't have any favorite games yet.</p>
                                <p className="text-sm text-[#6b7080] mt-1">Open a game and add it to your favorites.</p>
                            </div>
                        ) : (
                            <ul className="-mx-2">
                                {favorites.map((fav, i) => (
                                    <li key={i} className="group flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04]">
                                        <Link to={`/allreview/${fav.gameId}`} onClick={closeFavModal} className="text-sm font-medium text-[#d4d7de] hover:text-white truncate">
                                            {fav.name}
                                        </Link>
                                        <button
                                            onClick={() => delFav(fav.gameId)}
                                            aria-label={`Remove ${fav.name}`}
                                            className="p-1.5 rounded-md text-[#6b7080] hover:text-red-400 hover:bg-red-500/10 sm:opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <BsTrash3 className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </ModalShell>
                )}
            </AnimatePresence>
        </>
    );
}
