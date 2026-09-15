import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { BsArrowLeft, BsStarFill, BsHeart, BsHeartFill } from 'react-icons/bs';
import SystemRequirements from '../Components/SystemRequirements.jsx';
import { rawgImg, rawgSrcSet } from '../Components/rawgImage.js';
import ReviewsPanel from '../Components/ReviewsPanel.jsx';
import { API_BASE, cachedFetch, peekCached } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';

const GAMES_URL = `${API_BASE}/fetch-games`;
const findGame = (data, id) => (Array.isArray(data?.games) ? data.games.find(g => g.id == id) : undefined);

// locale / tba come from useT() in components (defaults keep the English output)
export function formatDate(value, locale = 'en-US', tba = 'TBA') {
    if (!value) return tba;
    const date = new Date(value);
    return isNaN(date) ? value : date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function DetailRow({ label, children, wide }) {
    return (
        <div className={`py-3 border-t border-white/[0.06] min-w-0 ${wide ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <dt className="gh-eyebrow mb-1">{label}</dt>
            <dd className="text-sm text-[#d4d7de] break-words">{children}</dd>
        </div>
    );
}

// Details list: two columns on tablets, one column in the desktop sidebar
export function DetailList({ children }) {
    return (
        <div className="overflow-hidden">
            <dl className="-mt-px grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">{children}</dl>
        </div>
    );
}

// Banner + title block shared by the game pages
export function GameHero({ game, genres, children }) {
    const { t } = useT();
    return (
        <>
            <div className="relative h-[300px] sm:h-[360px] md:h-[400px] overflow-hidden">
                <img
                    src={rawgImg(game.background_image, 1280)}
                    srcSet={rawgSrcSet(game.background_image) ? `${rawgImg(game.background_image, 640)} 640w, ${rawgImg(game.background_image, 1280)} 1280w` : undefined}
                    sizes="100vw"
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-[#0a0b0f]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/70 to-transparent" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 -mt-44 sm:-mt-52 md:-mt-60">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 py-2 -my-2 text-sm text-[#c9ccd4] hover:text-white transition-colors mb-4 sm:mb-6"
                >
                    <BsArrowLeft />
                    {t('game.backToHome')}
                </Link>

                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    {/* The banner already shows the artwork on phones, so the cover only appears from md */}
                    <img
                        src={rawgImg(game.background_image, 640)}
                        alt={game.name}
                        decoding="async"
                        className="hidden md:block md:w-64 lg:w-80 flex-shrink-0 aspect-[16/10] object-cover rounded-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                    />
                    <div className="flex-1 min-w-0">
                        {genres.length > 0 && (
                            <p className="gh-eyebrow !text-[#a1a6b3] mb-2">{genres.slice(0, 3).join(' · ')}</p>
                        )}
                        <h1 className="text-[1.875rem] sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.08] break-words">{game.name}</h1>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

export function PageState({ children }) {
    return (
        <>
            <Header />
            <div className="min-h-[70vh] flex items-center justify-center px-4">{children}</div>
            <Footer />
        </>
    );
}

export function Spinner() {
    return <div className="w-8 h-8 border-2 border-white/10 border-t-[#8b5cf6] rounded-full animate-spin" />;
}

// Reviews/favorites of Steam and GOG games are stored as "steam-730" / "gog-123";
// links built from those ids (header favorites, profile, review list) land on the store game page.
export default function AllReview() {
    const { gameId } = useParams();
    const storeGame = gameId?.match(/^(steam|gog)-(\d{1,12})$/);
    if (storeGame) return <Navigate replace to={`/game/${storeGame[1]}/${storeGame[2]}`} />;
    return <RawgGamePage key={gameId} />;
}

function RawgGamePage() {
    const { gameId } = useParams();
    const { user } = useContext(UserContext);
    const { t, locale } = useT();
    // The home page already has the game list cached, so the page usually renders instantly
    const [game, setGame] = useState(() => findGame(peekCached(GAMES_URL), gameId) || null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [fav, setFav] = useState(false);
    const [favok, setFavok] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(() => !game);
    const [reviewsVersion, setReviewsVersion] = useState(0);
    const [favError, setFavError] = useState("");

    useEffect(() => {
        async function fetchGame() {
            try {
                const data = await cachedFetch(GAMES_URL);
                const foundGame = findGame(data, gameId);
                if (foundGame) {
                    setGame(foundGame);
                } else {
                    setError('game.notFound');
                }
            } catch (err) {
                setError('game.fetchFailed');
            } finally {
                setLoading(false);
            }
        }

        fetchGame();
    }, [gameId]);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/get-all-reviews');
                const data = await response.json();
                const gameReviews = data.filter(review => review.gameId == gameId);
                setReviews(gameReviews);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            }
        }

        if (gameId) {
            fetchReviews();
        }
    }, [gameId, reviewsVersion]);

    useEffect(() => {
        async function getFavok() {
            if (!user) return;

            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
                const json = await resp.json();
                setFavok(json);
            } catch (err) {
                console.error('Failed to fetch favorites:', err);
            }
        }

        getFavok();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [user]);

    useEffect(() => {
        if (favok.length > 0 && game) {
            const isFav = favok.some(favItem => favItem.gameId == game.id);
            setFav(isFav);
        }
    }, [favok, game]);

    async function addFav() {
        if (!user) {
            setFavError("game.favLoginRequired");
            return;
        }

        const favData = { name: game.name, gameId: game.id, userId: user.uid };
        try {
            const resp = await fetch("https://gamehub-backend-zekj.onrender.com/addfav", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(favData),
            });

            if (resp.ok) {
                setFavok([...favok, favData]);
                setFav(true);
            } else {
                setFavError("game.favAddFailed");
            }
        } catch (err) {
            setFavError("game.favAddFailed");
        }
    }

    async function delFav() {
        const favData = { userId: user.uid };
        try {
            const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/delfav/${game.id}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(favData),
            });

            if (resp.ok) {
                setFavok(favok.filter(favItem => favItem.gameId !== game.id));
                setFav(false);
            } else {
                setFavError("game.favDeleteFailed");
            }
        } catch (err) {
            setFavError("game.favDeleteFailed");
        }
    }

    async function submitReview() {
        if (!newReview || rating === 0) {
            setError("reviews.validation");
            return;
        }

        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/submit-review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameId: game.id,
                    userId: user ? user.uid : "anonymous",
                    email: user ? user.email : "anonymous@domain.com",
                    reviewText: newReview,
                    rating,
                    gameName: game.name,
                }),
            });

            if (response.ok) {
                setError("");
                setNewReview("");
                setRating(0);
                setReviewsVersion(v => v + 1);
            } else {
                setError("reviews.submitFailed");
            }
        } catch (error) {
            setError("reviews.submitFailed");
            console.error("Error submitting review:", error);
        }
    }

    if (loading) {
        return <PageState><Spinner /></PageState>;
    }

    if (!game) {
        return <PageState><p className="text-[#a1a6b3]">{t(error || 'game.notFound')}</p></PageState>;
    }

    const requirementsPlatform = game.platforms?.find(p => p.requirements_en?.minimum || p.requirements_en?.recommended);
    const genres = game.genres?.map(g => g.name) || [];

    return (
        <>
            <Header />
            <main className="min-h-screen text-white">
                <GameHero game={game} genres={genres}>
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-sm text-[#a1a6b3]">
                        {game.rating ? (
                            <span className="inline-flex items-center gap-1.5">
                                <BsStarFill className="text-amber-400" />
                                <span className="font-semibold text-white">{game.rating}</span>
                                <span>/ 5</span>
                            </span>
                        ) : null}
                        <span>{t('game.released', { date: formatDate(game.released, locale, t('game.tba')) })}</span>
                        {game.metacritic ? (
                            <span className="inline-flex items-center gap-2">
                                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold ${game.metacritic >= 75 ? 'bg-emerald-500/15 text-emerald-400' : game.metacritic >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                                    {game.metacritic}
                                </span>
                                Metacritic
                            </span>
                        ) : null}
                        {game.playtime ? <span>{t('game.avgPlaytime', { hours: game.playtime })}</span> : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {fav ? (
                            <button onClick={delFav} className="gh-btn gh-btn-secondary !h-11 w-full sm:w-auto">
                                <BsHeartFill className="text-[#f87171]" />
                                {t('game.inFavorites')}
                            </button>
                        ) : (
                            <button onClick={addFav} className="gh-btn gh-btn-primary !h-11 w-full sm:w-auto">
                                <BsHeart />
                                {t('game.addFavorite')}
                            </button>
                        )}
                    </div>
                    {favError && <p className="text-sm text-red-400 mt-3">{t(favError)}</p>}
                </GameHero>

                {/* Content: phones/tablets stack requirements, details, reviews; desktop puts details in a sidebar */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 lg:items-start">
                    {/* display:contents below lg lets the aside slot between requirements and reviews via order */}
                    <div className="contents lg:flex lg:flex-col lg:gap-10 lg:col-span-2 min-w-0">
                    {requirementsPlatform && (
                        <div className="order-1 min-w-0">
                            <SystemRequirements
                                minimum={requirementsPlatform.requirements_en?.minimum}
                                recommended={requirementsPlatform.requirements_en?.recommended}
                                platform={requirementsPlatform.platform?.name || 'PC'}
                            />
                        </div>
                    )}


                    <div className="order-3 min-w-0">
                        <ReviewsPanel
                            user={user}
                            reviews={reviews}
                            newReview={newReview}
                            setNewReview={setNewReview}
                            rating={rating}
                            setRating={setRating}
                            onSubmit={submitReview}
                            error={error && t(error)}
                        />
                    </div>
                    </div>

                    <aside className="order-2 lg:order-none min-w-0 lg:sticky lg:top-24">
                        <div className="gh-surface p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-white mb-2">{t('game.details')}</h3>
                            <DetailList>
                                <DetailRow label={t('game.releaseDate')}>{formatDate(game.released, locale, t('game.tba'))}</DetailRow>
                                {game.esrb_rating?.name && <DetailRow label={t('game.ageRating')}>{game.esrb_rating.name}</DetailRow>}
                                <DetailRow label={t('game.platforms')} wide>
                                    {game.platforms?.length ? game.platforms.map(p => p.platform.name).join(', ') : '—'}
                                </DetailRow>
                                {game.stores?.length > 0 && (
                                    <DetailRow label={t('game.stores')} wide>
                                        {game.stores.map(s => s.store.name).join(', ')}
                                    </DetailRow>
                                )}
                                {game.tags?.length > 0 && (
                                    <DetailRow label={t('game.tags')} wide>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {game.tags.slice(0, 10).map((tag, i) => (
                                                <span key={i} className="gh-chip">{tag.name}</span>
                                            ))}
                                        </div>
                                    </DetailRow>
                                )}
                            </DetailList>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </>
    );
}
