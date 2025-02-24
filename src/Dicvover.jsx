import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Search from "./Search.jsx";
import SearchFind from "./SearchFind.jsx";

import Pagination from '@mui/material/Pagination';
import './body.css';

export default function Discover() {
    const [allGames, setAllGames] = useState([]);
    const [games, setGames] = useState([]);
    const [modalStoreVisible, setStoreVisible] = useState(false);

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                if (data.games && Array.isArray(data.games)) {
                    setAllGames(data.games); // Access games
                }
            } catch (error) {
                console.error("Error fetching featured games:", error);
            }
        }
        fetchFeaturedGames();
    }, []);

    const [gamesFree, setGamesFree] = useState([]);
    useEffect(() => {
        async function fetchGames() {
            try {
                const response = await fetch("https://gamehub-backend-zekj.onrender.com/free");
                const data = await response.json();
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
            }
        }
        fetchGames();
    }, []);


    // Paginate from MUI
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 20;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const currentGames = gamesFree.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);
    const pageCount = Math.ceil(gamesFree.length / gamesPerPage);

    return (
        <div>
            
            <header className="p-4 bg-gray-800 flex justify-between items-center flex-wrap">
                <div className="head flex items-center space-x-4">
                    <Link to="/"><h1 className="text-3xl font-bold text-white cursor-pointer">Game Data Hub</h1></Link>
                    <div className="navbar flex flex-wrap justify-center space-x-4">
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Stores</button>
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Favourites</button>
                        <Link to="/login">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Login/Sign-Up</button>
                        </Link>
                        <Link to="/discover">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Discover</button>
                        </Link>
                    </div>
                </div>
                <div className='float-right bg-gray-800'> <Search games={games} setGames={setGames} /> </div>
            </header>
            <div className='rights bg-gray-900'> <SearchFind games={games} setGames={setGames} /> </div>

            <div className=" bg-gray-900">
                <div className=" mx-auto p-4">
                    <section id="featured-games" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
                        <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.isArray(allGames) && allGames.length > 0 ? (
                                allGames.map((game) => (
                                    <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer">
                                        <img src={game.background_image} alt={game.name} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold mb-2 ">{game.name}</h3>
                                            <div className="flex-grow"></div>
                                            <div className="float-start"><p className="text-sm text-gray-400">Rating: {game.rating}/5</p></div>
                                        </div>
                                    </div>
                                ))
                            ) : (<p className="text-white">No games found. :(</p>)}
                        </div>
                    </section>
                </div>
            </div>

            <div className="p-4 bg-gray-900">
                <section id="featured-games" className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">All Free Games</h2>
                    <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {currentGames.length > 0 ? (
                            currentGames.map((game) => (
                                <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer">
                                    <img src={game.thumbnail} alt={game.title} className="game-image" />
                                    <div className="game-details">
                                        <h3 className="text-lg font-bold text-white">{game.title}</h3>
                                        <div className="platforms text-sm text-gray-600">
                                            <div className="flex-grow"></div>
                                            <div className="float-start">
                                                <span className="font-semibold">Platform:</span> {game.platform}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (<p className="text-white">No games found.</p>)}
                    </div>
                </section>
            </div>

            <div className="p-4 bg-gray-900 text-white">
                <div className="flex justify-center bg-gray-800 text-white ">
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={(event, value) => paginate(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </div>
            </div>

         
        </div>
    );
}
