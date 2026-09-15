import React, { lazy, Suspense, useEffect, useState, useContext, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserContext } from './Features/UserContext.jsx';
import { CgGames } from "react-icons/cg";
import { BsShop, BsChatSquareText, BsStarFill, BsStar, BsX, BsList, BsTrash3, BsBoxArrowUpRight, BsSearch, BsGrid, BsPeople, BsDownload, BsChevronDown } from "react-icons/bs";
import { AnimatePresence, motion } from 'framer-motion';
import Search from './Features/Search.jsx';
import { cachedFetch } from './Components/apiCache.js';
import { STORE_GROUPS, countCatalogueGames } from './Components/storeDirectory.js';
import UserAvatar from './Components/profile/UserAvatar.jsx';
// Loaded on demand: the bell only for signed-in users, the install dialog when opened
const NotificationBell = lazy(() => import('./notifications/NotificationBell.jsx'));
const InstallAppModal = lazy(() => import('./pwa/InstallAppModal.jsx'));
import { useInstall } from './pwa/install.js';
import { COMMUNITY_GROUPS } from './community/links.js';
import { useT } from './i18n/index.jsx';

// Icon-only on tablets (md), icon + label from lg so the search field keeps its width
const navItemClass = "inline-flex items-center justify-center gap-2 h-9 min-w-9 px-2.5 lg:px-3 rounded-lg text-sm font-medium transition-colors";
const navIdle = "text-[#a1a6b3] hover:text-white hover:bg-white/[0.05]";
const navActive = "text-white bg-white/[0.07]";

function ModalShell({ onClose, title, subtitle, maxWidth = 'max-w-md', children }) {
    const { t } = useT();
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
                        aria-label={t('common.close')}
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

function CommunityMenu({ onInstall }) {
    const { t } = useT();
    const { installed } = useInstall();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = e => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button className={`${navItemClass} ${open ? navActive : navIdle}`} onClick={() => setOpen(o => !o)} aria-expanded={open} title={t('nav.community')}>
                <BsPeople />
                <span className="hidden lg:inline">{t('nav.community')}</span>
                <BsChevronDown className={`hidden lg:inline w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-11 w-[560px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-[#111319] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-[150]">
                    <div className="grid grid-cols-3 gap-3">
                        {COMMUNITY_GROUPS.map(group => (
                            <div key={group.id} className="min-w-0">
                                <p className="gh-eyebrow px-2 pt-1 pb-2">{t(`nav.groups.${group.id}`)}</p>
                                <ul>
                                    {group.links.map(link => {
                                        const Icon = link.icon;
                                        return (
                                            <li key={link.to}>
                                                <NavLink
                                                    to={link.to}
                                                    onClick={() => setOpen(false)}
                                                    className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors ${isActive ? 'bg-white/[0.07] text-white' : 'text-[#c9ccd4] hover:bg-white/[0.05] hover:text-white'}`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0 text-[#8b5cf6]" aria-hidden="true" />
                                                    <span className="truncate">{t(`nav.links.${link.key}`)}</span>
                                                </NavLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <Link to="/community" onClick={() => setOpen(false)} className="px-2 py-1.5 text-sm font-medium text-[#c4b5fd] hover:text-white">
                            {t('nav.communityTitle')} →
                        </Link>
                        {!installed && (
                            <button onClick={() => { setOpen(false); onInstall(); }} className="gh-btn gh-btn-secondary !h-8 !text-xs">
                                <BsDownload /> {t('nav.installApp')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header({ setGames, setSearchTrue, games }) {
    const [storeCounts, setStoreCounts] = useState({});
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext) || {};
    const { t } = useT();
    const { installed } = useInstall();
    const [installOpen, setInstallOpen] = useState(false);

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
            <header className="sticky top-0 z-[100] pt-[env(safe-area-inset-top)]">
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
                        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-shrink-0" aria-label={t('header.mainNav')}>
                            <button className={`${navItemClass} ${navIdle}`} onClick={openStores} title={t('header.stores')}>
                                <BsShop />
                                <span className="hidden lg:inline">{t('header.stores')}</span>
                            </button>
                            <NavLink to="/hub" className={({ isActive }) => `${navItemClass} ${isActive ? navActive : navIdle}`} title={t('header.hub')}>
                                <BsGrid />
                                <span className="hidden lg:inline">{t('header.hub')}</span>
                            </NavLink>
                            <NavLink to="/review" className={({ isActive }) => `${navItemClass} ${isActive ? navActive : navIdle}`} title={t('header.reviews')}>
                                <BsChatSquareText />
                                <span className="hidden lg:inline">{t('header.reviews')}</span>
                            </NavLink>
                            <CommunityMenu onInstall={() => setInstallOpen(true)} />

                            <span className="mx-1.5 lg:mx-2 h-6 w-px bg-white/[0.08]" />

                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Suspense fallback={<span className="h-9 w-9" />}><NotificationBell /></Suspense>
                                    <button
                                        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.05] transition-colors"
                                        onClick={openFavModal}
                                        aria-label={t('header.favorites')}
                                        title={t('header.favorites')}
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
                                    {t('header.login')}
                                </Link>
                            )}
                        </nav>

                        {/* Mobile: search shortcut + menu toggle (the search field lives at the top of the menu) */}
                        <div className="md:hidden flex items-center gap-1 -mr-2">
                        {user && !menuOpen && <Suspense fallback={null}><NotificationBell /></Suspense>}
                        {!menuOpen && (
                            <button
                                className="p-2.5 rounded-lg text-[#c9ccd4] hover:bg-white/[0.06] transition-colors"
                                onClick={() => setMenuOpen(true)}
                                aria-label={t('header.searchGames')}
                            >
                                <BsSearch className="w-[18px] h-[18px]" />
                            </button>
                        )}
                        <button
                            className="p-2 rounded-lg text-[#c9ccd4] hover:bg-white/[0.06] transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
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
                                <BsShop className="text-[#6b7080]" /> {t('header.stores')}
                            </button>
                            <Link to="/hub" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                <BsGrid className="text-[#6b7080]" /> {t('header.hub')}
                            </Link>
                            <Link to="/review" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                <BsChatSquareText className="text-[#6b7080]" /> {t('header.reviews')}
                            </Link>

                            {COMMUNITY_GROUPS.map(group => (
                                <div key={group.id} className="pt-3 mt-2 border-t border-white/[0.06]">
                                    <p className="gh-eyebrow px-3 pb-1.5">{t(`nav.groups.${group.id}`)}</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        {group.links.map(link => {
                                            const Icon = link.icon;
                                            return (
                                                <Link key={link.to} to={link.to} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#c9ccd4] hover:bg-white/[0.05] min-w-0">
                                                    <Icon className="shrink-0 text-[#8b5cf6]" /> <span className="truncate">{t(`nav.links.${link.key}`)}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {!installed && (
                                <button className="flex items-center gap-3 w-full px-3 py-3 mt-2 rounded-lg text-[#c9ccd4] bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20" onClick={() => { setMenuOpen(false); setInstallOpen(true); }}>
                                    <BsDownload className="text-[#c4b5fd]" /> {t('nav.installApp')}
                                </button>
                            )}

                            <div className="pt-3 mt-2 border-t border-white/[0.06]">
                                {user ? (
                                    <>
                                        <button className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]" onClick={openFavModal}>
                                            <BsStar className="text-[#6b7080]" />
                                            {t('header.favorites')}
                                            <span className="ml-auto text-xs text-[#6b7080]">{favorites.length}</span>
                                        </button>
                                        <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#c9ccd4] hover:bg-white/[0.05]">
                                            <UserAvatar className="h-6 w-6 bg-[#1e222c] text-xs font-semibold text-[#c4b5fd]" />
                                            {t('header.profile')}
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/login" className="gh-btn gh-btn-primary w-full">{t('header.login')}</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {installOpen && <Suspense fallback={null}><InstallAppModal open onClose={() => setInstallOpen(false)} /></Suspense>}

            {/* Stores Modal */}
            <AnimatePresence>
                {modalStoreVisible && (
                    <ModalShell
                        onClose={() => setStoreVisible(false)}
                        title={t('header.storesTitle')}
                        subtitle={t('header.storesSubtitle')}
                        maxWidth="max-w-3xl"
                    >
                        <div className="space-y-6">
                            {STORE_GROUPS.map(group => (
                                <div key={group.id}>
                                    <h4 className="gh-eyebrow mb-2.5">{group.titleKey ? t(group.titleKey) : group.title}</h4>
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
                                                                        {t('header.gameCount', { count })}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="block text-xs text-[#8a8f9c] truncate">{shop.mentionedKey ? t(shop.mentionedKey) : shop.mentioned}</span>
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
                            {t('header.storesNote')}
                        </p>
                    </ModalShell>
                )}
            </AnimatePresence>

            {/* Favorites Modal */}
            <AnimatePresence>
                {isFavModalOpen && (
                    <ModalShell onClose={closeFavModal} title={t('header.favorites')} subtitle={favorites.length ? t('header.savedGames', { count: favorites.length }) : null}>
                        {favorites.length === 0 ? (
                            <div className="text-center py-10">
                                <BsStar className="mx-auto text-[#3a3f4b] text-3xl mb-4" />
                                <p className="text-sm text-[#a1a6b3]">{t('header.noFavorites')}</p>
                                <p className="text-sm text-[#6b7080] mt-1">{t('header.noFavoritesHint')}</p>
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
                                            aria-label={t('header.removeFavorite', { name: fav.name })}
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
