import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Rotate from "./Rotate.jsx"
import Stores from './Stores.jsx';
import ShowCards from './ShowCards.jsx';
import FeaturedGames from './FeaturedGames.jsx';
import Search from './Search.jsx';
import SearchFind from './SearchFind.jsx';
import MainSection from './MainSection.jsx';
import StoresFooter from './StoresFooter.jsx';
import FreeGames from './FreeGames.jsx';

export default function Notfound() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [rating, setRatings] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const name = "";

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();

                if (data.games && Array.isArray(data.games)) {
                    setAllGames(data.games); // Access games
                } else {
                    console.error("Wrong data:", data);
                    setAllGames([]);
                }
            } catch (error) {
                console.error("Error fetching featured games:", error);
                setAllGames([]);
            }
        }
        fetchFeaturedGames();
    }, []);


    useEffect(() => {
        if (allGames.length > 0) {
            categorizeGames();
        }
    }, [allGames]);


    function categorizeGames() {
        setMultiplayerGames(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("multiplayer"))));
        setActionGames(allGames.filter(game => game.genres?.some(genre => genre.name.toLowerCase().includes("action"))));
        setScifi(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("sci-fi"))));
        setExplore(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("exploration"))));
    }


    function showGameDetails(game) {
        const requirements = game.platforms && game.platforms.length > 0
            ? game.platforms.map(platform => {
                const req = platform.requirements_en || {};
                return req.minimum ? `${platform.platform.name}: ${req.minimum}` : null;
            }).filter(Boolean).join(", ") : "N/A";

        setSelectedGame({ ...game, requirements, });
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    return (
        <div>
            <header className="p-4 bg-gray-800 flex justify-between items-center flex-wrap">
                <div className="head flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-white cursor-pointer" onClick={() => Refresh()}>Game Data Hub</h1>
                    <div className="navbar flex flex-wrap justify-center space-x-4">
                        <button className="nav-button text-white px-4 py-2 rounded-lg" id="stores-button">
                            Stores
                            <div className="dropdown hidden absolute bg-white text-black mt-2 rounded-lg shadow-lg" id="stores-dropdown"> </div> </button>
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Favourites</button>
                        <Link to="/login">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Profile</button>
                        </Link>
                    </div>
                </div>
                <div className='float-right bg-gray-800'> <Search games={games} setGames={setGames} /> </div>
            </header>

            <div className="main-content flex h-screen">
                
                <div className='rights bg-gray-900'> <SearchFind games={games} setGames={setGames} /> </div>
                <div className='allSections'>
                    <MainSection allGames={allGames} showGameDetails={showGameDetails} />
                    <FeaturedGames allGames={allGames} showGameDetails={showGameDetails} />
                    <Rotate games={multiplayerGames} showGameDetails={showGameDetails} name={"Multiplayer games"}/>
                    <Rotate games={actionGames} showGameDetails={showGameDetails} name={"Action games"}/>
                    <FreeGames />
                    <Rotate games={scifi} showGameDetails={showGameDetails} name={"Sci-fi games"}/>
                    <Rotate games={exploration} showGameDetails={showGameDetails} name={"Exploration games"}/>
                
                     <StoresFooter />
                </div>
               
            </div>
            <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />
            <Stores modalStoreVisible={modalStoreVisible} />
        </div>
    );
}