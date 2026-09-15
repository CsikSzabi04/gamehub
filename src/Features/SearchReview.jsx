import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { BsStarFill } from 'react-icons/bs';
import SystemRequirements from '../Components/SystemRequirements.jsx';
import ReviewsPanel from '../Components/ReviewsPanel.jsx';
import { formatDate, DetailRow, DetailList, GameHero, PageState, Spinner } from './AllReview.jsx';
import { cachedFetch, peekCached } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';

const gameUrl = id => `https://api.rawg.io/api/games/${encodeURIComponent(id)}?key=984255fceb114b05b5e746dc24a8520a`;

// The detail response already contains the platform requirements (a second request by slug returned the same data)
function withRequirements(data) {
    if (!data || data.detail) return data;
    const pc = data.platforms?.find(p => p.platform?.slug == 'pc');
    return pc?.requirements?.minimum ? { ...data, requirements: pc.requirements } : data;
}

export default function SearchReview() {
    const { gameId } = useParams();
    const { user } = useContext(UserContext);
    const { t, locale } = useT();
    const [game, setGame] = useState(() => withRequirements(peekCached(gameUrl(gameId))) || null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(() => !game);
    const [reviewsVersion, setReviewsVersion] = useState(0);

    useEffect(() => {
        async function fetchGame() {
            try {
                const data = await cachedFetch(gameUrl(gameId), { maxAge: 24 * 60 * 60 * 1000 });
                setGame(withRequirements(data));

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

    async function submitReview() {
        if (!newReview || rating == 0) {
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
                        {game.metacritic ? <span>Metacritic {game.metacritic}</span> : null}
                        {game.playtime ? <span>{t('game.avgPlaytime', { hours: game.playtime })}</span> : null}
                    </div>
                </GameHero>

                {/* Phones/tablets: about, requirements, details, reviews. Desktop: details in a sidebar */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 lg:items-start">
                    <div className="contents lg:flex lg:flex-col lg:gap-10 lg:col-span-2 min-w-0">
                        {game.description_raw && (
                            <div className="order-1 min-w-0">
                                <h3 className="gh-section-title mb-3">{t('game.about')}</h3>
                                <p className="text-sm sm:text-[15px] leading-7 text-[#c9ccd4] whitespace-pre-line line-clamp-[12]">{game.description_raw}</p>
                            </div>
                        )}

                        {game.requirements && (
                            <div className="order-2 min-w-0">
                                <SystemRequirements
                                    minimum={game.requirements.minimum}
                                    recommended={game.requirements.recommended}
                                    platform="PC"
                                />
                            </div>
                        )}

                        <div className="order-4 min-w-0">
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

                    <aside className="order-3 lg:order-none min-w-0 lg:sticky lg:top-24">
                        <div className="gh-surface p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-white mb-2">{t('game.details')}</h3>
                            <DetailList>
                                <DetailRow label={t('game.releaseDate')}>{formatDate(game.released, locale, t('game.tba'))}</DetailRow>
                                {game.esrb_rating?.name && <DetailRow label={t('game.ageRating')}>{game.esrb_rating.name}</DetailRow>}
                                <DetailRow label={t('game.platforms')} wide>
                                    {game.platforms?.length ? game.platforms.map(p => p.platform.name).join(', ') : '—'}
                                </DetailRow>
                                {game.developers?.length > 0 && (
                                    <DetailRow label={t('game.developer')}>{game.developers.map(d => d.name).join(', ')}</DetailRow>
                                )}
                                {game.publishers?.length > 0 && (
                                    <DetailRow label={t('game.publisher')}>{game.publishers.map(d => d.name).join(', ')}</DetailRow>
                                )}
                                {game.stores?.length > 0 && (
                                    <DetailRow label={t('game.stores')} wide>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {game.stores.map(({ store }) => (
                                                <a
                                                    key={store.id}
                                                    href={store.domain ? `https://${store.domain}` : `https://${store.slug}.com`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="gh-chip !py-1.5 hover:text-white hover:border-white/20 transition-colors"
                                                >
                                                    {store.name}
                                                </a>
                                            ))}
                                        </div>
                                    </DetailRow>
                                )}
                                {game.tags?.length > 0 && (
                                    <DetailRow label={t('game.tags')} wide>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {game.tags.slice(0, 10).map(tag => (
                                                <span key={tag.id} className="gh-chip">{tag.name}</span>
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
