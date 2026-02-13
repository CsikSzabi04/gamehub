import React, { useEffect, useState } from "react";
import RotateFree from "../Rotate/RotateFree.jsx";

export default function FreeGames() {
    const [freeGames, setFreeGames] = useState([]);

    useEffect(() => {
        fetchFreeGames();
    }, []);

    async function fetchFreeGames() {
        try {
            const response = await fetch("");
            const data = await response.json();

            const freeGames = data.data.Catalog.searchStore.elements.map((game) => ({
                id: game.id,
                name: game.title,
                background_image: game.keyImages[0]?.url || "", 
                originalPrice: game.price.totalPrice?.originalPrice || "N/A", 
                discountPrice: game.price.totalPrice?.discountPrice || "N/A", 
                endDate: game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]?.endDate.split("T")[0] || "N/A", 
            }));

            setFreeGames(freeGames);
        } catch (error) {
            console.error("Error fetching free games from Epic:", error);
        }
    }
    function showGameDetails(game) {
        console.log("Game Details:", game);
    }

    return (
        <section id="free-games" className="mb-8" data-aos="fade-up">
            <RotateFree games={freeGames} showGameDetails={showGameDetails} name="Free Games" />
        </section>
    );
}
