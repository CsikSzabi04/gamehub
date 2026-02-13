import React, { useEffect, useState } from "react";
import RotateFree from "../Rotate/RotateFree.jsx";

export default function Free() {
    const [games, setGames] = useState([]);

    useEffect(() => {
        fetchGames();
    }, []);

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

            setGames(gamesData);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    }

    function showGameDetails(game) {
        console.log("Game Details:", game);
        window.open(game.game_url, '_blank');
    }

    return (
        <section id="free-games" className="mb-8" data-aos="fade-up">
            <RotateFree games={games} showGameDetails={showGameDetails} name="Free Games" />
        </section>
    );
}
