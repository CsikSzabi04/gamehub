import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Rotate from "./Rotate.jsx"
import ShowCards from './ShowCards.jsx';
import FeaturedGames from './FeaturedGames.jsx';
import Search from './Search.jsx';
import SearchFind from './SearchFind.jsx';
import MainSection from './MainSection.jsx';
import StoresFooter from './StoresFooter.jsx';
import Free from './Free.jsx';
import News from './News.jsx';
import Discounted from './Discounted.jsx';
import "tailwindcss";

export default function Body() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [rating, setRatings] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [store, setStore] = useState([])
    const [modalStoreVisible, setStoreVisible] = useState(false)
    const name = "";

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

    function ref() {
        window.location.reload();
    }
    useEffect(() => {
        async function getStores() {
            try {
                const resp = await fetch('https://gamehub-backend-zekj.onrender.com/stores');
                const data = await resp.json();
                setStore(data)
            } catch (error) { console.log({ "Fetch error: ": error }) }
        }
        getStores()
    }, [])
    function stores() {
        setStoreVisible(true)
        //console.log(store)
    }
    function closeStore() { setStoreVisible(false) }

    function openStoreUrl(name) {
        console.log(name);

        let url = "";

        if (name.toLowerCase() == 'steam') {
            url = 'store.steampowered.com/';
        } else if (name.toLowerCase() == 'getgamez') {
            url = 'getgamez.net/';
        } else if (name.toLowerCase() == 'playfield') {
            url = 'www.playitstore.hu/';
        } else if (name.toLowerCase() == 'imperial games') {
            url = 'imperial.games/';
        } else if (name.toLowerCase() == 'funstockdigital') {
            url = 'funstock.eu';
        } else if (name.toLowerCase() == 'razer game store') {
            url = 'www.razer.com/eu-en/store';
        } else {
            url = `${name.toLowerCase().replace(/\s+/g, '')}.com`; //itt Bence te a store.storeName.toLowerCase-t tetted... XDD
        }

        window.open(`https://${url}`, '_blank');
    }


    return (
        <div>
            <header className="p-4 bg-gray-800 flex justify-between items-center flex-wrap">
                <div className="head flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-white cursor-pointer" onClick={ref}>Game Data Hub</h1>
                    <div className="navbar flex flex-wrap justify-center space-x-4">
                        <button className="nav-button text-white px-4 py-2 rounded-lg" onClick={stores}>Stores</button>
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Favourites</button>
                        <Link to="/discover">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Discover</button>
                        </Link>
                        <Link to="/login">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Login/Sign-Up</button>
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
                    <Free />
                    <Rotate games={multiplayerGames} showGameDetails={showGameDetails} name={"Multiplayer games"} />
                    <Rotate games={actionGames} showGameDetails={showGameDetails} name={"Action games"} />
                    <Discounted />
                    <Rotate games={scifi} showGameDetails={showGameDetails} name={"Sci-fi games"} />
                    <Rotate games={exploration} showGameDetails={showGameDetails} name={"Exploration games"} />
                    <News />
                    <StoresFooter />
                </div>
            </div>
            <ShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible} />

            {modalStoreVisible && (
                <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="modal-content text-white p-6 rounded-lg">
                        <span className="close-button text-2xl absolute top-2 right-2 cursor-pointer" onClick={closeStore} >&times; </span>
                        <div className="store space-y-4 overflow-y-auto max-h-96">
                            {store.map((x, i) => <div key={i}><p onClick={() => openStoreUrl(x.storeName)} className='store-row'> <span className='storename'>{x.storeName}</span>  <img src={`https://www.cheapshark.com${x.images.logo}`} alt={x.storeName} className="store-pic" /></p></div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
