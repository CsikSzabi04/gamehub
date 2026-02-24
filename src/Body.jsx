import './body.css';
import React, { useEffect, useState } from "react";
import Rotate from "./Rotate/Rotate.jsx"
import ShowCards from './Features/ShowCards.jsx';
import FeaturedGames from '././Sections/FeaturedGames.jsx'; 
import SearchFind from './Features/SearchFind.jsx';
import MainSection from './Sections/MainSection.jsx';
import UnderMain from './Sections/UnderMain.jsx';
import StoresFooter from './Stores/StoresFooter.jsx';
import Free from '././Sections/Free.jsx'; 
import Loot from '././Sections/Loot.jsx';
import News from './Sections/News.jsx';
import Discounted from '././Sections/Discounted.jsx';
import "tailwindcss";
import Mobile from './Sections/Mobile.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import GamingNews from './Sections/GamingNews.jsx';
import StartUp from './Features/StartUp.jsx';
import ReviewsOpenMain from './Sections/ReviewsOpenMain.jsx';
import DBD_Movies from './FeaturesByGame/DBD_Movies.jsx';
import LazySection from './Components/LazySection.jsx';


export default function Body() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [store, setStore] = useState([])
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [searchTrue, setSearchTrue] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [componentsLoaded, setComponentsLoaded] = useState(false);

    // Check if this is a first load (not navigation from within the app)
    const [isFirstLoad, setIsFirstLoad] = useState(() => {
        const hasVisited = sessionStorage.getItem('hasVisited');
        return !hasVisited;
    });

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                setAllGames(data.games);
                setComponentsLoaded(true);
            } catch (error) {
                console.error("Error:", error);
            }
        }
        fetchFeaturedGames();
    }, []);


    useEffect(() => {
        if (allGames.length > 0) {
            categorizeGames();
        } setStoreVisible(false);
         window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
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

    return (
        <div>
            {isFirstLoad && !isLoaded ? (
                <StartUp onLoaded={() => { setIsLoaded(true); sessionStorage.setItem('hasVisited', 'true'); }} />
            ) : (
            <>
            <Header searchTrue={searchTrue} setSearchTrue={setSearchTrue} setGames={setGames} games={games}/>
            {searchTrue == false ? (
                <div className="main-content w-full">
                    <div className='allSections'>      
                        <LazySection>
                            <MainSection allGames={allGames} showGameDetails={showGameDetails} />
                        </LazySection>
                        
                        <LazySection>
                            <FeaturedGames allGames={allGames} showGameDetails={showGameDetails} />
                        </LazySection>
                        <LazySection>
                            <Free />
                        </LazySection>
                        <LazySection>
                            <Rotate games={multiplayerGames} showGameDetails={showGameDetails} name={"Multiplayer games"} intervalTimeA={8000} k={200}/>
                        </LazySection>
                        <LazySection>
                            <Rotate games={actionGames} showGameDetails={showGameDetails} name={"Action games"}  intervalTimeA={6800} k={220}/>
                        </LazySection>
                        <LazySection>
                            <Discounted />
                        </LazySection>
                        <LazySection>
                            <ReviewsOpenMain allGames={allGames} showGameDetails={showGameDetails}/>
                        </LazySection>
                        <LazySection>
                            <Mobile />
                        </LazySection>
                        <LazySection>
                            <Rotate games={scifi} showGameDetails={showGameDetails} name={"Sci-fi games"}  intervalTimeA={8000} k={240}/>
                        </LazySection>
                        <LazySection>
                            <Rotate games={exploration} showGameDetails={showGameDetails} name={"Exploration games"} intervalTimeA={8700} k={250}/>
                        </LazySection>
                        <LazySection>
                            <News />
                        </LazySection>
                        <LazySection>
                            <Loot />
                        </LazySection>
                        <LazySection>
                            <UnderMain allGames={allGames} showGameDetails={showGameDetails}/>
                        </LazySection>
                        <LazySection>
                            <DBD_Movies />
                        </LazySection>
                        <LazySection>
                            <GamingNews />
                        </LazySection>
                       
                        <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />
                    </div>
                    <Footer />
                </div>
            ) : <div className='rights '> <SearchFind games={games} setGames={setGames} /> </div>}
            </>
            )}
        </div>
    );
}
