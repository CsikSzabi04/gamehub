import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext.jsx';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import './Features.css'
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaSearch, FaUser } from 'react-icons/fa';
import { useT } from '../i18n/index.jsx';

export default function Review() {
    const [allGames, setAllGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [rating, setRating] = useState(0);
    const { user } = useContext(UserContext) || {};
    const { t } = useT();

    useEffect(() => {
        async function fetchGames() {
            const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
            const data = await response.json();
            setAllGames(Array.isArray(data?.games) ? data.games : []);
        }
        fetchGames();
    }, []);

    const fetchReviews = async () => {
        const response = await fetch("https://gamehub-backend-zekj.onrender.com/get-all-reviews");
        const reviewsData = await response.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    };

    async function handleReviewSubmit() {
        if (!reviewText || rating === 0) return;

        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/submit-review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameId: selectedGame?.id || 0,
                    userId: user ? user.uid : "anonymous",
                    reviewText,
                    rating,
                    gameName: selectedGame?.name || "Unknown Game",
                }),
            });

            if (response.ok) {
                setReviewText("");
                setRating(0);
                setSearchTerm("");
                setSelectedGame(null);
                fetchReviews();
            } else {
                console.error("Error submitting review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    function showGameDetails(game) {
        setSelectedGame(game);
        setSearchTerm(game.name);
    }

    const filteredGames = allGames.filter(game => 
        String(game?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchReviews(); 
    }, []);

    return (
        <>
            <div className='min-h-screen'>
                <Header />
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">{t('reviews.title')}</h1>
                        <p className="mt-2 text-[#a1a6b3]">{t('reviews.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side - Write Review */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="gh-surface p-5 lg:sticky lg:top-24">
                                <h2 className="!mb-4 text-base font-semibold text-white">{t('reviews.write')}</h2>

                                {/* Search Game */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="w-3.5 h-3.5 text-[#6b7080]" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('reviews.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="gh-input !pl-10"
                                    />
                                </div>

                                {/* Search Results */}
                                {searchTerm && filteredGames.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto bg-[#171a22] border border-white/[0.08] rounded-lg mb-4 -mt-2">
                                        {filteredGames.slice(0, 5).map(game => (
                                            <div 
                                                key={game.id} 
                                                className="py-2.5 px-3 text-sm text-[#d4d7de] cursor-pointer hover:bg-white/[0.05] hover:text-white transition-colors"
                                                onClick={() => showGameDetails(game)}
                                            >
                                                {game.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Selected Game */}
                                {selectedGame && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 px-3 py-2.5 rounded-lg bg-[#171a22] border-l-2 border-[#8b5cf6]"
                                    >
                                        <p className="gh-eyebrow mb-0.5">{t('reviews.selectedGame')}</p>
                                        <p className="text-sm text-white font-semibold">{selectedGame.name}</p>
                                    </motion.div>
                                )}

                                {/* Review Text */}
                                <textarea
                                    placeholder={t('reviews.textPlaceholder')}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="gh-input mb-4 resize-none"
                                />

                                {/* Rating Stars */}
                                <div className="flex items-center gap-1 mb-5">
                                    <span className="text-sm text-[#a1a6b3] mr-2">{t('reviews.rating')}</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <motion.button
                                            key={star}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`text-2xl leading-none transition-colors ${rating >= star ? 'text-amber-400' : 'text-[#2a2e38] hover:text-amber-300/70'}`}
                                            onClick={() => setRating(star)}
                                        >
                                            ★
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReviewSubmit}
                                    disabled={!reviewText || rating === 0}
                                    className="gh-btn gh-btn-primary w-full !h-11"
                                >
                                    {t('reviews.post')}
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Right Side - Reviews */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2"
                        >
                            <div>
                                <div className="flex items-baseline justify-between mb-4">
                                    <h2 className="gh-section-title !mb-0">{t('reviews.latest')}</h2>
                                    <span className="text-sm text-[#6b7080]">{t('reviews.total', { count: reviews.length })}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {reviews.length > 0 ? (
                                        reviews.map((review, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index, 6) * 0.04 }}
                                                className="group gh-surface p-5 hover:border-white/[0.16] transition-colors"
                                            >
                                                <Link to={`/reviews/${review.gameId}`} className="block">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-base font-semibold text-white group-hover:underline underline-offset-4 decoration-white/30">
                                                                {review.gameName}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <FaUser className="w-2.5 h-2.5 text-[#6b7080]" />
                                                                <span className="text-[#6b7080] text-xs truncate">{review.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span 
                                                                key={i} 
                                                                className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-[#2a2e38]'}`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    
                                                    <p className="text-[#c9ccd4] text-sm leading-relaxed line-clamp-3">
                                                        {review.review}
                                                    </p>
                                                </Link>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full gh-surface text-center py-12">
                                            <FaStar className="w-6 h-6 text-[#3a3f4b] mx-auto mb-3" />
                                            <p className="text-sm">{t('reviews.empty')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
