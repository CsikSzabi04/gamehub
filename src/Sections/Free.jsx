import React from "react";
import RotateFree from "../Rotate/RotateFree.jsx";
import { API_BASE, useApi } from "../Components/apiCache.js";
import { SectionLoader } from "../Components/SectionHeader.jsx";
import { useT } from "../i18n/index.jsx";

function toFreeGames(data) {
    if (!Array.isArray(data)) return [];
    return data.map((game) => ({
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
}

export default function Free() {
    const { t } = useT();
    const { data: games, loading } = useApi(`${API_BASE}/free`, toFreeGames);

    function showGameDetails(game) {
        window.open(game.game_url, '_blank');
    }

    return (
        <section id="free-games" className="!mb-12">
            {!loading && games ? (
                <RotateFree games={games} showGameDetails={showGameDetails} name={t('home.free.title')} />
            ) : (
                <SectionLoader title={t('home.free.loading')} height="h-[330px]" />
            )}
        </section>
    );
}
