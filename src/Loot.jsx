import React, { useEffect, useState } from "react";
import RotateLoot from "./Rotate/RotateLoot.jsx";

export default function Giveaways() {
    const [giveaways, setGiveaways] = useState([]);

    useEffect(() => {
        fetchGiveaways();
    }, []);

    async function fetchGiveaways() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/loot"); 
            const data = await response.json();

            const giveawaysData = data.map((giveaway) => ({
                id: giveaway.id,
                title: giveaway.title,
                description: giveaway.description,
                thumbnail: giveaway.thumbnail,
                platforms: giveaway.platforms,
                instructions: giveaway.instructions,
                openGiveawayUrl: giveaway.open_giveaway_url,
                gamerPowerUrl: giveaway.gamerpower_url,
                publishedDate: giveaway.published_date,
                status: giveaway.status,
            }));

            setGiveaways(giveawaysData);
        } catch (error) {
            console.error("Error fetching giveaways:", error);
        }
    }

    function showGiveawayDetails(giveaway) {
        console.log("Giveaway Details:", giveaway);
        window.open(giveaway.openGiveawayUrl, "_blank");
    }

    return (
        <section  className="mb-8">
            <RotateLoot giveaways={giveaways} showGiveawayDetails={showGiveawayDetails}  name={"Loot"}/>
        </section>
    );
}
