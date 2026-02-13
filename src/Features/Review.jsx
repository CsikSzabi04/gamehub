import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext.jsx';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import './Features.css'
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaSearch, FaPen, FaUser } from 'react-icons/fa';

export default function Review() {
    const [allGames, setAllGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [rating, setRating] = useState(0);
    const { user } = useContext(UserContext) || {};

    useEffect(() => {
        async function fetchGames() {
            const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
            const data = await response.json();
            setAllGames(data.games);
        }
        fetchGames();
    }, []);

    const fetchReviews = async () => {
        const response = await fetch("https://gamehub-backend-zekj.onrender.com/get-all-reviews");
        const reviewsData = await response.json();
        setReviews(reviewsData);
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
                    email: user ? user.email : "anonymous@domain.com",
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
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchReviews(); 
    }, []);

    return (
        <>
            <div className='min-h-screen'>
                <Header />
                <div className="max-w-7xl mx-auto p-6 md:p-8 pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side - Write Review */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
                                        <FaPen className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Write a Review</h2>
                                </div>

                                {/* Search Game */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search for a game..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                                    />
                                </div>

                                {/* Search Results */}
                                {searchTerm && filteredGames.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-xl mb-4">
                                        {filteredGames.slice(0, 5).map(game => (
                                            <div 
                                                key={game.id} 
                                                className="py-3 px-4 text-white cursor-pointer hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors"
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
                                        className="mb-6 p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30"
                                    >
                                        <p className="text-sm text-gray-400 mb-1">Selected Game</p>
                                        <p className="text-white font-semibold">{selectedGame.name}</p>
                                    </motion.div>
                                )}

                                {/* Review Text */}
                                <textarea
                                    placeholder="Write your review..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="w-full mb-4 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all resize-none"
                                />

                                {/* Rating Stars */}
                                <div className="flex gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <motion.button
                                            key={star}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`text-2xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-gray-600 hover:text-amber-300'}`}
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
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Review
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Right Side - Reviews */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                                        <FaStar className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Community Reviews</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((review, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ y: -4 }}
                                                className="group bg-white/5 border border-white/5 hover:border-violet-500/30 rounded-2xl p-5 transition-all"
                                            >
                                                <Link to={`/reviews/${review.gameId}`} className="block">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-white font-semibold group-hover:text-violet-300 transition-colors">
                                                                {review.gameName}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <FaUser className="w-3 h-3 text-gray-500" />
                                                                <span className="text-gray-500 text-sm">{review.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span 
                                                                key={i} 
                                                                className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-gray-600'}`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    
                                                    <p className="text-gray-400 text-sm line-clamp-3">
                                                        {review.review}
                                                    </p>
                                                </Link>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-12">
                                            <FaStar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">No reviews yet. Be the first to write one!</p>
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
