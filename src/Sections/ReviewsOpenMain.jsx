import { Link } from 'react-router-dom';
import React from 'react';
import { BsStarFill, BsArrowRight } from 'react-icons/bs';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { rawgImg } from '../Components/rawgImage.js';
import { SectionLoader } from '../Components/SectionHeader.jsx';
import { useT } from '../i18n/index.jsx';

const toReviews = data => (Array.isArray(data) ? data : []);

function Stars({ value }) {
    return (
        <div className="flex gap-0.5 text-[11px]">
            {[...Array(5)].map((_, i) => (
                <BsStarFill key={i} className={i < Math.round(value) ? 'text-amber-400' : 'text-[#2a2e38]'} />
            ))}
        </div>
    );
}

export default function ReviewsOpenMain({ allGames, showGameDetails }) {
    const { t } = useT();
    const { data: reviews, loading } = useApi(`${API_BASE}/get-all-reviews`, toReviews);

    if (loading || !reviews) {
        return <div><SectionLoader title={t('home.reviews.title')} height="h-[300px]" /></div>;
    }

    if (!Array.isArray(reviews) || reviews.length === 0) return null;

    const uniqueGameIds = [];
    reviews.forEach(review => { if (!uniqueGameIds.includes(review.gameId)) uniqueGameIds.push(review.gameId); });

    const reviewedGames = [];
    for (let i = 0; i < uniqueGameIds.length; i++) {
        const gameId = uniqueGameIds[i];
        const game = allGames.find(game => game.id == gameId);
        if (game) {
            const gameReviews = reviews.filter(review => review.gameId == gameId);
            reviewedGames.push({ ...game, reviews: gameReviews });
        }
    }

    const finalReviewedGames = reviewedGames.slice(0, 5);
    if (finalReviewedGames.length === 0) return null;

    const [lead, ...rest] = finalReviewedGames;

    return (
        <section className="!mb-12">
            <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="gh-section-title !mb-0">{t('home.reviews.title')}</h2>
                <Link to="/review" className="inline-flex items-center gap-1.5 text-sm text-[#a1a6b3] hover:text-white transition-colors">
                    {t('home.reviews.seeAll')} <BsArrowRight />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Lead review */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => showGameDetails(lead)}
                    onKeyDown={(e) => { if (e.key === 'Enter') showGameDetails(lead); }}
                    className="group relative overflow-hidden rounded-xl bg-[#111319] min-h-[300px] cursor-pointer"
                >
                    <img loading="lazy" decoding="async" src={rawgImg(lead.background_image, 1280)} alt={lead.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <Stars value={lead.reviews[0].rating} />
                        <p className="mt-3 text-base sm:text-lg leading-snug text-white line-clamp-3">“{lead.reviews[0].review}”</p>
                        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-white truncate">{lead.name}</span>
                            <span className="text-[#a1a6b3] truncate">{lead.reviews[0].email}</span>
                        </div>
                    </div>
                </div>

                {/* Other reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rest.map((game) => (
                        <Link
                            key={game.id}
                            to={`/allreview/${game.id}`}
                            className="gh-surface p-4 flex flex-col hover:border-white/[0.16] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <img loading="lazy" decoding="async" src={rawgImg(game.background_image, 80)} alt="" width="48" height="48" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-white truncate">{game.name}</h3>
                                    <Stars value={game.reviews[0].rating} />
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-[#c9ccd4] leading-relaxed line-clamp-3">{game.reviews[0].review}</p>
                            <p className="mt-auto pt-3 text-xs text-[#6b7080] truncate">
                                {game.reviews[0].email}
                                {game.reviews.length > 1 && ` · ${t('home.reviews.count', { count: game.reviews.length })}`}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
