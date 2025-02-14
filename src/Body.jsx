import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Rotate from "./Rotate.jsx"

export default function Notfound() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [ps5Games, setPs5Games] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null); // New state for selected game
    const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility

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

    async function fetchPS5Games() {
        try {
            const response = await fetch(`https://api.rawg.io/api/games?key=984255fceb114b05b5e746dc24a8520a&page_size=8&platforms=18`);
            if (!response.ok) throw new Error("Failed to fetch PS5 games");

            const data = await response.json();
            setPs5Games(data.results);
        } catch (error) {
            console.error("Error fetching PS5 games:", error);
        }
    }

    function categorizeGames() {
        setMultiplayerGames(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("multiplayer"))));
        setActionGames(allGames.filter(game => game.genres?.some(genre => genre.name.toLowerCase().includes("action"))));

        fetchPS5Games();
    }

    // Updated showGameDetails function
    function showGameDetails(game) {
        const requirements = game.platforms && game.platforms.length > 0
            ? game.platforms.map(platform => {
                const req = platform.requirements_en || {};
                return req.minimum ? `${platform.platform.name}: ${req.minimum}` : null;
            }).filter(Boolean).join(", ") : "N/A";

        setSelectedGame({ ...game, requirements, });
        setModalVisible(true); // Show the modal
    }

    // Close the modal
    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    return (
        <div>
            <header className="p-4 bg-gray-800 flex justify-between items-center flex-wrap">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-white cursor-pointer">Game Data Hub</h1>
                    <div className="navbar flex flex-wrap justify-center space-x-4">
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Stores</button>
                        <button className="nav-button text-white px-4 py-2 rounded-lg">Favourites</button>
                        <Link to="/login">
                            <button className="nav-button text-white px-4 py-2 rounded-lg">Profile</button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="main-content">
                <div className="container mx-auto p-4">
                    <section id="featured-games" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
                        <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.isArray(allGames) && allGames.length > 0 ? (
                                allGames.map((game) => (
                                    <div
                                        key={game.id}
                                        className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
                                        onClick={() => showGameDetails(game)}
                                    >
                                        <img src={game.background_image} alt={game.name} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold mb-2 truncate">{game.name}</h3>
                                            <p className="text-sm text-gray-400">Released: {game.released || 'N/A'}</p>
                                            <p className="text-sm text-gray-400">Rating: {game.rating || 'N/A'}/5</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white">No games found.</p>
                            )}
                        </div>
                    </section>
                </div>


                <div className='allSections'>
                    <section id="multiplayer-games" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Multiplayer Games</h2>
                        <div className="carousel-container overflow-hidden">
                            <div className="carousel flex space-x-4">
                                <Rotate games={multiplayerGames} showGameDetails={showGameDetails}/>
                            </div>
                        </div>
                    </section>


                    <section id="action-games" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Action Games</h2>
                        <div className="carousel-container overflow-hidden">
                            <div className="carousel flex space-x-4">
                                {actionGames.map((game) => (
                                    <div key={game.id} className="game-card carousel-item" onClick={() => showGameDetails(game)}>
                                        <img src={game.background_image} alt={game.name} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                            <p className="text-sm text-gray-400">Released: {game.released || "N/A"}</p>
                                            <p className="text-sm text-gray-400">Rating: {game.rating || "N/A"}/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="ps5-games" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">PlayStation 5 Games</h2>
                        <div className="carousel-container overflow-hidden">
                            <div className="carousel flex space-x-4">
                                {ps5Games.map((game) => (
                                    <div key={game.id} className="game-card carousel-item" onClick={() => showGameDetails(game)}>
                                        <img src={game.background_image} alt={game.name} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                            <p className="text-sm text-gray-400">Released: {game.released || "N/A"}</p>
                                            <p className="text-sm text-gray-400">Rating: {game.rating || "N/A"}/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal for Game Details */}
            {modalVisible && selectedGame && (

                <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" id="game-modal">
                    <div className="modal-content bg-gray-900 p-6 rounded-lg max-w-md w-full">
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <img src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 w-full object-cover" />
                        <h2 className="text-3xl font-bold mb-4">{selectedGame.name}</h2>
                        <p>Release Date:{selectedGame.released || "N/A"}</p>
                        <p>Rating: {selectedGame.rating || "N/A"}/5</p>
                        <p>Stores: {selectedGame.stores ? selectedGame.stores.map(store => store.store.name).join(", ") : "N/A"}</p>
                        <p>Platforms: {selectedGame.platforms ? selectedGame.platforms.map(p => p.platform.name).join(", ") : "N/A"}</p>
                        <div className="row">
                            <p>Genres: <div id="tag"> {selectedGame.tags ? selectedGame.tags.map(g => g.name).join(", ") : "N/A"}</div></p>
                        </div>
                        <div className="collapsible">
                            <div className="collapsible-header">
                                Minimum Requirements
                            </div>
                            <ul className="collapsible-content">
                                <li>{selectedGame.requirements}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
        </div>

    );
}
