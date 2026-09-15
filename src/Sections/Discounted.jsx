import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import RotateDiscounted from "../Rotate/RotateDiscounted.jsx";
import { API_BASE, cachedFetch, useApi } from "../Components/apiCache.js";
import { SectionLoader } from "../Components/SectionHeader.jsx";
import { titleMatch } from "../gamepage/matching.js";
import { useT } from "../i18n/index.jsx";

const rawgSearchUrl = name =>
    `https://api.rawg.io/api/games?key=984255fceb114b05b5e746dc24a8520a&search=${encodeURIComponent(name)}&search_precise=true&page_size=6`;

// Epic's CDN resizes on request; the originals are ~500 kB each
function epicImage(game) {
    const image = game.keyImages?.find(k => k.type === "OfferImageTall") || game.keyImages?.[0];
    if (!image?.url) return "";
    return image.url.includes("epicgames.com") ? `${image.url}${image.url.includes("?") ? "&" : "?"}h=480&w=360&resize=1&quality=medium` : image.url;
}

function epicStoreUrl(game) {
    const slug = game.catalogNs?.mappings?.find(m => m.pageType === "productHome")?.pageSlug
        || game.offerMappings?.[0]?.pageSlug
        || game.productSlug?.replace(/\/home$/, "");
    return slug ? `https://store.epicgames.com/p/${slug}` : "https://store.epicgames.com/free-games";
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
            url: epicStoreUrl(game),
        }));
    }
    return [];
}

export default function Discounted() {
    const { t } = useT();
    const navigate = useNavigate();
    const { data: freeGames, loading } = useApi(`${API_BASE}/discounted`, toDiscounted);
    const opening = useRef(false);

    // Epic games have no in-site page of their own: open the matching game page, or the Epic store page
    async function showGameDetails(game) {
        if (opening.current) return;
        opening.current = true;
        try {
            const data = await cachedFetch(rawgSearchUrl(game.name), { maxAge: 24 * 60 * 60 * 1000 });
            const results = Array.isArray(data?.results) ? data.results : [];
            const match = results.find(r => titleMatch(r.name, game.name) === "exact") || results.find(r => titleMatch(r.name, game.name));
            if (match) {
                navigate(`/searchreview/${match.id}`);
                return;
            }
        } catch (err) {
            console.error("RAWG lookup failed:", err);
        } finally {
            opening.current = false;
        }
        window.open(game.url, "_blank", "noopener,noreferrer");
    }

    return (
        <section id="discounted-games" className="!mb-12">
            {loading || !freeGames ? (
                <SectionLoader title={t('home.discounted.title')} height="h-[380px]" />
            ) : freeGames.length > 0 ? (
                <RotateDiscounted
                    games={freeGames}
                    showGameDetails={showGameDetails}
                    name={t('home.discounted.title')}
                />
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
