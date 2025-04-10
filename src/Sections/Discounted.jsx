import React, { useEffect, useState } from "react";
import RotateDiscounted from "../Rotate/RotateDiscounted.jsx";
import DiscountedShowCards from "../Features/DiscountedShowCards.jsx";

export default function Discounted() {
    const [freeGames, setFreeGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchFreeGames();
    }, []);

    async function fetchFreeGames() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/discounted");
            const data = await response.json();

            const freeGames = data.data.Catalog.searchStore.elements.map((game) => ({
                id: game.id,
                name: game.title,
                background_image: game.keyImages[0]?.url || "", 
                originalPrice: game.price.totalPrice?.originalPrice/100 || "?", 
                discountPrice: game.price.totalPrice?.discountPrice/100 || "?", 
                Status: game.status, 
            }));

            setFreeGames(freeGames);
        } catch (error) {
            console.error("Error fetching free games from Epic:", error);
        }
    }

    function showGameDetails(game) {
        setSelectedGame(game);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    return (
        <section id="free-games" className="mb-8">
            <RotateDiscounted  games={freeGames}  showGameDetails={showGameDetails}  name="Discounted Games" />
            {modalVisible && selectedGame && ( <DiscountedShowCards selectedGame={selectedGame} closeModal={closeModal} modalVisible={modalVisible}/>)}
        </section>
    );
}