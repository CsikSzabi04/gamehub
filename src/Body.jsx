import './body.css';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import FeaturedGames from '././Sections/FeaturedGames.jsx';
import MainSection from './Sections/MainSection.jsx';
import Header from './Header.jsx';
import LazySection from './Components/LazySection.jsx';
import { API_BASE, useApi } from './Components/apiCache.js';
import { searchRawgGames } from './Features/Search.jsx';

// Above the fold (Header, hero, featured grid) is in the main bundle.
// Everything below is split into chunks that load as the user scrolls towards them.
const Rotate = lazy(() => import("./Rotate/Rotate.jsx"));
const Free = lazy(() => import('././Sections/Free.jsx'));
const Discounted = lazy(() => import('././Sections/Discounted.jsx'));
const ReviewsOpenMain = lazy(() => import('./Sections/ReviewsOpenMain.jsx'));
const Mobile = lazy(() => import('./Sections/Mobile.jsx'));
const News = lazy(() => import('./Sections/News.jsx'));
const Loot = lazy(() => import('././Sections/Loot.jsx'));
const UnderMain = lazy(() => import('./Sections/UnderMain.jsx'));
const DBD_Movies = lazy(() => import('./FeaturesByGame/DBD_Movies.jsx'));
const GamingNews = lazy(() => import('./Sections/GamingNews.jsx'));
const Footer = lazy(() => import('./Footer.jsx'));
const ShowCards = lazy(() => import('./Features/ShowCards.jsx'));
const SearchFind = lazy(() => import('./Features/SearchFind.jsx'));
// Live data from the hub APIs (Steam charts, deals, speedruns, game universes)
const LivePlayers = lazy(() => import('./Hub/LivePlayers.jsx'));
const DealsHub = lazy(() => import('./Hub/DealsHub.jsx'));
const ComingSoon = lazy(() => import('./Hub/ComingSoon.jsx'));
const CommunityTrends = lazy(() => import('./Hub/CommunityTrends.jsx'));
const SpeedrunFeed = lazy(() => import('./Hub/SpeedrunFeed.jsx'));
const UniverseStrip = lazy(() => import('./Hub/UniverseStrip.jsx'));

const GAMES_URL = `${API_BASE}/fetch-games`;
const toGames = data => (Array.isArray(data?.games) ? data.games : []);
const EMPTY = [];

const hasTag = (game, text) => game.tags?.some(tag => tag.name.toLowerCase().includes(text));
const hasGenre = (game, text) => game.genres?.some(genre => genre.name.toLowerCase().includes(text));

// The cached/snapshot list is usually replaced by an identical live list a moment later.
// Keep the first array while the game IDs are unchanged, so the hero and cards don't reshuffle.
function useStableGames(games) {
    const ref = useRef({ key: '', games: EMPTY });
    const key = games.map(g => g.id).join(',');
    if (key !== ref.current.key) ref.current = { key, games };
    return ref.current.games;
}

export default function Body() {
    const { data: liveGames = EMPTY } = useApi(GAMES_URL, toGames);
    const allGames = useStableGames(liveGames);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMounted, setModalMounted] = useState(false);
    const [games, setGames] = useState([]);
    const [searchTrue, setSearchTrue] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // A search started from another page navigates here with the query in the router state
    const pendingSearch = location.state?.search;
    useEffect(() => {
        if (!pendingSearch) return;
        searchRawgGames(pendingSearch)
            .then(results => {
                setGames(results);
                setSearchTrue(true);
            })
            .catch(err => console.error("Error fetching games:", err));
        // Clear the state so a refresh / back navigation doesn't repeat the search
        navigate(location.pathname, { replace: true, state: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSearch]);

    const categories = useMemo(() => ({
        multiplayer: allGames.filter(game => hasTag(game, "multiplayer")),
        action: allGames.filter(game => hasGenre(game, "action")),
        scifi: allGames.filter(game => hasTag(game, "sci-fi")),
        exploration: allGames.filter(game => hasTag(game, "exploration")),
    }), [allGames]);

    function showGameDetails(game) {
        const requirements = game.platforms?.map(p => p.requirements_en?.minimum).join(", ");
        setSelectedGame({ ...game, requirements });
        setModalMounted(true);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    return (
        <div>
            <Header searchTrue={searchTrue} setSearchTrue={setSearchTrue} setGames={setGames} games={games} />
            {searchTrue == false ? (
                <div className="main-content w-full">
                    <div className='allSections'>
                        <MainSection allGames={allGames} showGameDetails={showGameDetails} />
                        <FeaturedGames allGames={allGames} showGameDetails={showGameDetails} />

                        <LazySection>
                            <LivePlayers />
                        </LazySection>
                        <LazySection>
                            <Free />
                        </LazySection>
                        <LazySection>
                            <DealsHub />
                        </LazySection>
                        <LazySection>
                            <Rotate games={categories.multiplayer} showGameDetails={showGameDetails} name={"Multiplayer games"} intervalTimeA={8000} />
                        </LazySection>
                        <LazySection>
                            <Rotate games={categories.action} showGameDetails={showGameDetails} name={"Action games"} intervalTimeA={6800} />
                        </LazySection>
                        <LazySection>
                            <Discounted />
                        </LazySection>
                        <LazySection>
                            <ComingSoon />
                        </LazySection>
                        <LazySection>
                            <ReviewsOpenMain allGames={allGames} showGameDetails={showGameDetails} />
                        </LazySection>
                        <LazySection>
                            <Mobile />
                        </LazySection>
                        <LazySection placeholder={false}>
                            <CommunityTrends />
                        </LazySection>
                        <LazySection>
                            <UniverseStrip />
                        </LazySection>
                        <LazySection>
                            <Rotate games={categories.scifi} showGameDetails={showGameDetails} name={"Sci-fi games"} intervalTimeA={8000} />
                        </LazySection>
                        <LazySection>
                            <Rotate games={categories.exploration} showGameDetails={showGameDetails} name={"Exploration games"} intervalTimeA={8700} />
                        </LazySection>
                        <LazySection>
                            <News />
                        </LazySection>
                        <LazySection>
                            <Loot />
                        </LazySection>
                        <LazySection>
                            <SpeedrunFeed />
                        </LazySection>
                        <LazySection>
                            <UnderMain allGames={allGames} showGameDetails={showGameDetails} />
                        </LazySection>
                        <LazySection>
                            <DBD_Movies />
                        </LazySection>
                        <LazySection>
                            <GamingNews />
                        </LazySection>

                        {modalMounted && (
                            <Suspense fallback={null}>
                                <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />
                            </Suspense>
                        )}
                    </div>
                    <LazySection placeholder={false}>
                        <Footer />
                    </LazySection>
                </div>
            ) : (
                <div className='rights '>
                    <Suspense fallback={<div className="min-h-[50vh]" />}>
                        <SearchFind games={games} setGames={setGames} />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
