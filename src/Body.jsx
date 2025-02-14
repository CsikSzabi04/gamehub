import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './body.css';

export default function Notfound() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [ps5Games, setPs5Games] = useState([]);

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('http://localhost:88/fetch-games');
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
                                    <div key={game.id} className="game-card hover:shadow-xl hover:scale-105 transition transform cursor-pointer">
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
            </div>

            <div className='allSections'> 
                <section id="multiplayer-games" className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Multiplayer Games</h2>
                    <div className="carousel-container overflow-hidden">
                        <div className="carousel flex space-x-4">
                            {multiplayerGames.map((game) => (
                                <div key={game.id} className="game-card carousel-item">
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


                <section id="action-games" className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Action Games</h2>
                    <div className="carousel-container overflow-hidden">
                        <div className="carousel flex space-x-4">
                            {actionGames.map((game) => (
                                <div key={game.id} className="game-card carousel-item">
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
                                <div key={game.id} className="game-card carousel-item">
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
    );
}