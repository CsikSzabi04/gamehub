// The former /discover page, now part of the Hub: genre rows, the full catalogue,
// news and every free-to-play game, with pagination.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsChevronRight, BsBoxArrowUpRight } from 'react-icons/bs';
import News from '../Sections/News.jsx';
import UnderMain from '../Sections/UnderMain.jsx';
import GameCard from '../Components/GameCard.jsx';
import { API_BASE, cachedFetch } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';

const GAMES_PER_PAGE = 10;
const FREE_PER_PAGE = 12;

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
    const base = 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors';
    const idle = 'text-[#a1a6b3] hover:bg-white/[0.06] hover:text-white';
    const go = n => onChange(Math.min(Math.max(1, n), count));
    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-1" aria-label={t('discover.pagination')}>
            <button onClick={() => go(page - 1)} disabled={page === 1} className={`${base} ${idle} disabled:opacity-30 disabled:pointer-events-none`} aria-label={t('discover.previousPage')}>
                <BsChevronLeft />
            </button>
            {pageNumbers(page, count).map(n => (
                <button key={n} onClick={() => go(n)} className={`${base} ${page === n ? 'bg-[#eceef2] text-[#0a0b0f]' : idle}`} aria-current={page === n ? 'page' : undefined}>
                    {n}
                </button>
            ))}
            {count > 5 && page < count - 2 && (
                <>
                    <span className="px-1 text-[#6b7080]">…</span>
                    <button onClick={() => go(count)} className={`${base} ${idle}`}>{count}</button>
                </>
            )}
            <button onClick={() => go(page + 1)} disabled={page === count} className={`${base} ${idle} disabled:opacity-30 disabled:pointer-events-none`} aria-label={t('discover.nextPage')}>
                <BsChevronRight />
            </button>
        </nav>
    );
}

function GridSkeleton({ count }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: count }, (_, i) => (
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

export function CatalogueSection() {
    const { t } = useT();
    const navigate = useNavigate();
    const [allGames, setAllGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let alive = true;
        cachedFetch(`${API_BASE}/fetch-games`)
            .then(data => { if (alive && Array.isArray(data?.games)) setAllGames(data.games); })
            .catch(error => console.error('Error fetching games:', error))
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    const showGameDetails = game => navigate(`/allreview/${game.id}`);
    const pageCount = Math.ceil(allGames.length / GAMES_PER_PAGE);
    const current = allGames.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);

    return (
        <>
            <UnderMain allGames={allGames} showGameDetails={showGameDetails} />

            <section id="all-games" className="w-full mb-12 scroll-mt-24">
                <div className="flex items-end justify-between gap-4 mb-4">
                    <h2 className="gh-section-title !mb-0">{t('discover.allGames')}</h2>
                    {allGames.length > 0 && <span className="text-sm text-[#6b7080]">{t('discover.titles', { count: allGames.length })}</span>}
                </div>
                {loading ? (
                    <GridSkeleton count={GAMES_PER_PAGE} />
                ) : current.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                            {current.map(game => <GameCard key={game.id} game={game} onClick={showGameDetails} />)}
                        </div>
                        <Pagination page={page} count={pageCount} onChange={setPage} />
                    </>
                ) : (
                    <div className="gh-surface py-12 text-center"><p className="text-sm">{t('discover.noGames')}</p></div>
                )}
            </section>
        </>
    );
}

export function FreeGamesSection() {
    const { t } = useT();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let alive = true;
        cachedFetch(`${API_BASE}/free`)
            .then(data => { if (alive && Array.isArray(data)) setGames(data); })
            .catch(error => console.error('Error fetching free games:', error))
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    const pageCount = Math.ceil(games.length / FREE_PER_PAGE);
    const current = games.slice((page - 1) * FREE_PER_PAGE, page * FREE_PER_PAGE);

    return (
        <section id="free-to-play" className="w-full mb-12 scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="gh-section-title !mb-0">{t('discover.allFreeGames')}</h2>
                {games.length > 0 && <span className="text-sm text-[#6b7080]">{t('discover.titles', { count: games.length })}</span>}
            </div>
            {loading ? (
                <GridSkeleton count={FREE_PER_PAGE} />
            ) : current.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                        {current.map(game => (
                            <a key={game.id} href={game.game_url} target="_blank" rel="noopener noreferrer" className="game-card group flex flex-col">
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
                    <Pagination page={page} count={pageCount} onChange={setPage} />
                </>
            ) : (
                <div className="gh-surface py-12 text-center"><p className="text-sm">{t('discover.noGames')}</p></div>
            )}
        </section>
    );
}

export { News as NewsSection };
