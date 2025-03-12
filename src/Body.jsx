import React, { useEffect, useState, useContext } from 'react';
import './body.css';
import Rotate from "./Rotate.jsx"
import ShowCards from './ShowCards.jsx';
import FeaturedGames from './FeaturedGames.jsx';
import SearchFind from './SearchFind.jsx';
import MainSection from './MainSection.jsx';
import StoresFooter from './StoresFooter.jsx';
import Free from './Free.jsx';
import Loot from './Loot.jsx';
import News from './News.jsx';
import Discounted from './Discounted.jsx';
import "tailwindcss";
import Mobile from './Mobile.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

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
        <div className='bg-gray-900'>
            {/*{!isLoaded && <StartUp onLoaded={() => setIsLoaded(true)} />} {isLoaded && (*/}
            <Header searchTrue={searchTrue} setSearchTrue={setSearchTrue} setGames={setGames} games={games}/>
            {searchTrue == false ? (
                <div className="main-content flex h-screen ">
                    <div className='allSections'>
                        <MainSection allGames={allGames} showGameDetails={showGameDetails} />
                        <FeaturedGames allGames={allGames} showGameDetails={showGameDetails} />
                        <Free />
                        <Rotate games={multiplayerGames} showGameDetails={showGameDetails} name={"Multiplayer games"} />
                        <Rotate games={actionGames} showGameDetails={showGameDetails} name={"Action games"} />
                        <Discounted />
                        <Rotate games={scifi} showGameDetails={showGameDetails} name={"Sci-fi games"} />
                        <Mobile />
                        <Rotate games={exploration} showGameDetails={showGameDetails} name={"Exploration games"} />
                        <div id='news'><News /></div>
                        <Loot />
                        <StoresFooter />
                    </div>
                    <Footer />
                </div>
            ) : <div className='rights '> <SearchFind games={games} setGames={setGames} /> </div>}
            
            <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />
           
            {/*)}*/}
        </div>
    );
}
