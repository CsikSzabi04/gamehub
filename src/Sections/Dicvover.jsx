import { useState, useEffect } from "react";
import SearchFind from "../Features/SearchFind.jsx";
import ShowCards from "../Features/ShowCards.jsx";
import '../body.css';
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import News from "./News.jsx";
import UnderMain from './UnderMain.jsx';
import GameCard from "../Components/GameCard.jsx";
import { BsChevronLeft, BsChevronRight, BsBoxArrowUpRight } from "react-icons/bs";
import { cachedFetch } from "../Components/apiCache.js";
import { useT } from "../i18n/index.jsx";

function pageNumbers(page, count) {
    return Array.from({ length: Math.min(5, count) }, (_, i) => {
        if (count <= 5 || page <= 3) return i + 1;
        if (page >= count - 2) return count - 4 + i;
        return page - 2 + i;
    });
}

function Pagination({ page, count, onChange }) {
    const { t } = useT();
    if (count <= 1) return null;
    const base = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";
    const idle = "text-[#a1a6b3] hover:bg-white/[0.06] hover:text-white";
    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-1" aria-label={t('discover.pagination')}>
            <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${base} ${idle} disabled:opacity-30 disabled:pointer-events-none`} aria-label={t('discover.previousPage')}>
                <BsChevronLeft />
            </button>
            {pageNumbers(page, count).map((n) => (
                <button key={n} onClick={() => onChange(n)} className={`${base} ${page === n ? 'bg-[#eceef2] text-[#0a0b0f]' : idle}`} aria-current={page === n ? 'page' : undefined}>
                    {n}
                </button>
            ))}
            {count > 5 && page < count - 2 && (
                <>
                    <span className="px-1 text-[#6b7080]">…</span>
                    <button onClick={() => onChange(count)} className={`${base} ${idle}`}>{count}</button>
                </>
            )}
            <button onClick={() => onChange(page + 1)} disabled={page === count} className={`${base} ${idle} disabled:opacity-30 disabled:pointer-events-none`} aria-label={t('discover.nextPage')}>
                <BsChevronRight />
            </button>
        </nav>
    );
}

function GridSkeleton({ count }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="gh-surface overflow-hidden">
                    <div className="aspect-[16/10] bg-[#171a22] animate-pulse" />
                    <div className="p-3.5 space-y-2">
                        <div className="h-3.5 w-3/4 rounded bg-[#171a22]" />
                        <div className="h-3 w-1/3 rounded bg-[#171a22]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Discover() {
    const { t } = useT();
    const [allGames, setAllGames] = useState([]);
    const [games, setGames] = useState([]);
    const [gamesFree, setGamesFree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFree, setIsLoadingFree] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTrue, setSearchTrue] = useState(false);

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const data = await cachedFetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                if (data?.games && Array.isArray(data.games)) {
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
                if (!Array.isArray(data)) throw new Error("Unexpected response from /free");
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

    function showGameDetails(game) {
        const requirements = game.platforms?.map(p => p.requirements_en?.minimum).join(", ");
        setSelectedGame({ ...game, requirements });
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    function changePage(setter, count) {
        return (n) => {
            setter(Math.min(Math.max(1, n), count));
        };
    }

    return (
        <div>
            <Header searchTrue={searchTrue} setSearchTrue={setSearchTrue} setGames={setGames} games={games} />
            {searchTrue == false ? (
                <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-10 [--gh-edge:1rem]">
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">{t('discover.title')}</h1>
                        <p className="mt-2 text-[#a1a6b3]">{t('discover.intro')}</p>
                    </div>

                    <UnderMain allGames={allGames} showGameDetails={showGameDetails} />

                    <section id="featured-games" className="!mb-14">
                        <div className="flex items-end justify-between gap-4 mb-4">
                            <h2 className="gh-section-title !mb-0">{t('discover.allGames')}</h2>
                            {allGames.length > 0 && <span className="text-sm text-[#6b7080]">{t('discover.titles', { count: allGames.length })}</span>}
                        </div>
                        {isLoading ? (
                            <GridSkeleton count={featuredGamesPerPage} />
                        ) : currentFeaturedGames.length > 0 ? (
                            <>
                                <div id="games-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                    {currentFeaturedGames.map((game) => (
                                        <GameCard key={game.id} game={game} onClick={showGameDetails} />
                                    ))}
                                </div>
                                <Pagination page={featuredPage} count={featuredPageCount} onChange={changePage(paginateFeatured, featuredPageCount)} />
                            </>
                        ) : (
                            <div className="gh-surface py-12 text-center"><p className="text-sm">{t('discover.noGames')}</p></div>
                        )}
                    </section>

                    <News />

                    <section id="free-games" className="!mb-6">
                        <div className="flex items-end justify-between gap-4 mb-4">
                            <h2 className="gh-section-title !mb-0">{t('discover.allFreeGames')}</h2>
                            {gamesFree.length > 0 && <span className="text-sm text-[#6b7080]">{t('discover.titles', { count: gamesFree.length })}</span>}
                        </div>
                        {isLoadingFree ? (
                            <GridSkeleton count={gamesPerPage} />
                        ) : currentGames.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                                    {currentGames.map((game) => (
                                        <a
                                            key={game.id}
                                            href={game.game_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="game-card group flex flex-col"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden bg-[#171a22]">
                                                <img loading="lazy" decoding="async" src={game.thumbnail} alt={game.title} width="365" height="206" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="px-3.5 py-3">
                                                <h3 className="truncate text-sm font-semibold text-white">{game.title}</h3>
                                                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#6b7080]">
                                                    <span className="truncate">{game.genre}</span>
                                                    <BsBoxArrowUpRight className="flex-shrink-0 text-[10px] group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <Pagination page={currentPage} count={pageCount} onChange={changePage(paginate, pageCount)} />
                            </>
                        ) : (
                            <div className="gh-surface py-12 text-center"><p className="text-sm">{t('discover.noGames')}</p></div>
                        )}
                    </section>
                </main>
            ) : <div className='rights max-w-[1440px] mx-auto px-4 sm:px-6'> <SearchFind games={games} setGames={setGames} /> </div>}

            <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />

            <Footer />
        </div>
    );
}
