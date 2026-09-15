import React, { useState } from "react";
import RotateDiscounted from "../Rotate/RotateDiscounted.jsx";
import DiscountedShowCards from "../Features/DiscountedShowCards.jsx";
import { API_BASE, useApi } from "../Components/apiCache.js";
import { SectionLoader } from "../Components/SectionHeader.jsx";
import { useT } from "../i18n/index.jsx";

// Epic's CDN resizes on request; the originals are ~500 kB each
function epicImage(game) {
    const image = game.keyImages?.find(k => k.type === "OfferImageTall") || game.keyImages?.[0];
    if (!image?.url) return "";
    return image.url.includes("epicgames.com") ? `${image.url}${image.url.includes("?") ? "&" : "?"}h=480&w=360&resize=1&quality=medium` : image.url;
}

function toDiscounted(data) {

    if (data?.data?.Catalog?.searchStore?.elements) {
        return data.data.Catalog.searchStore.elements.map((game) => ({
            id: game.id,
            name: game.title,
            background_image: epicImage(game),
            originalPrice: game.price?.totalPrice?.originalPrice ? game.price.totalPrice.originalPrice / 100 : 0,
            discountPrice: game.price?.totalPrice?.discountPrice ? game.price.totalPrice.discountPrice / 100 : 0,
            Status: game.status || "ACTIVE",
        }));
    }
    return [];
}

export default function Discounted() {
    const { t } = useT();
    const { data: freeGames, loading } = useApi(`${API_BASE}/discounted`, toDiscounted);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    function showGameDetails(game) {
        setSelectedGame(game);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    return (
        <section id="discounted-games" className="!mb-12">
            {loading || !freeGames ? (
                <SectionLoader title={t('home.discounted.title')} height="h-[380px]" />
            ) : freeGames.length > 0 ? (
                <>
                    <RotateDiscounted
                        games={freeGames}
                        showGameDetails={showGameDetails}
                        name={t('home.discounted.title')}
                    />
                    <DiscountedShowCards
                        selectedGame={selectedGame}
                        closeModal={closeModal}
                        modalVisible={modalVisible}
                    />
                </>
            ) : (
                <div>
                    <h2 className="gh-section-title !mb-4">{t('home.discounted.title')}</h2>
                    <div className="gh-surface py-10 text-center">
                        <p className="text-sm">{t('home.discounted.empty')}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
