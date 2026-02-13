import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { FaArrowLeft, FaStar, FaHeart, FaCalendar, FaGamepad, FaPen } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ReviewsOpen() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [fav, setFav] = useState(false);
    const [favok, setFavok] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGame() {
            try {
                const response = await fetch(`https://gamehub-backend-zekj.onrender.com/fetch-games`);
                const data = await response.json();
                const foundGame = data.games.find(g => g.id == gameId);
                if (foundGame) {
                    setGame(foundGame);
                } else {
                    setError('Game not found');
                }
            } catch (err) {
                setError('Failed to fetch game details');
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
    }, [gameId, newReview]);

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
            setError("You must log in to add favorites.");
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
                setError("Failed to add to favorites.");
            }
        } catch (err) {
            setError("Failed to add to favorites.");
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
                setError("Failed to delete from favorites.");
            }
        } catch (err) {
            setError("Failed to delete from favorites.");
        }
    }

    async function submitReview() {
        if (!newReview || rating === 0) {
            setError("Please write a review and select a rating");
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
                setNewReview("");
                setRating(0);
                setNewReview(" ");
                setTimeout(() => setNewReview(""), 100);
            } else {
                setError("Failed to submit review");
            }
        } catch (error) {
            setError("Failed to submit review");
            console.error("Error submitting review:", error);
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"
                    />
                </div>
                <Footer />
            </>
        );
    }

    if (error && !game) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                    <p className="text-white">{error}</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!game) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                    <p className="text-white">Game not found</p>
                </div>
                <Footer />
            </>
        );
    }

    function parseRequirementsText(text) {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const cleanLine = line.replace(/<[^>]*>/g, '').trim();
            if (!cleanLine) return null;

            if (line.includes('<li>')) {
                return (
                    <div key={index} className="flex items-start mb-1">
                        <span className="text-violet-400 mr-2">•</span>
                        <span className="text-gray-300">{cleanLine}</span>
                    </div>
                );
            }

            if (line.includes('<strong>')) {
                return (
                    <div key={index} className="font-bold text-white mb-2">
                        {cleanLine}
                    </div>
                );
            }

            return (
                <div key={index} className="text-gray-300 mb-1">
                    {cleanLine}
                </div>
            );
        });
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#030712] text-white pt-20">
                {/* Background Image with Overlay */}
                <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                    <img 
                        loading="lazy" 
                        src={game.background_image} 
                        alt={game.name} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
                    {/* Game Info Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left - Image */}
                            <div className="lg:col-span-1">
                                <img 
                                    loading="lazy" 
                                    src={game.background_image} 
                                    alt={game.name} 
                                    className="w-full h-auto rounded-2xl object-cover mb-6"
                                />
                                
                                {/* Back Button */}
                                <Link 
                                    to="/" 
                                    className="group inline-flex items-center px-5 py-3 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/30 rounded-xl text-white font-medium transition-all"
                                >
                                    <FaArrowLeft className="mr-3 transition-transform group-hover:-translate-x-1" />
                                    Back
                                </Link>
                            </div>

                            {/* Right - Details */}
                            <div className="lg:col-span-2">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <h1 className="text-3xl md:text-4xl font-bold">{game.name}</h1>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        {fav ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={delFav}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                                            >
                                                <FaHeart className="fill-current" />
                                                Remove
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={addFav}
                                                className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-xl hover:bg-violet-500/30 transition-all"
                                            >
                                                <FaHeart />
                                                Add to Favorites
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Meta Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <FaCalendar className="w-4 h-4" />
                                            <span className="text-xs">Release Date</span>
                                        </div>
                                        <p className="font-medium">{game.released || "?"}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <FaStar className="w-4 h-4" />
                                            <span className="text-xs">Rating</span>
                                        </div>
                                        <p className="font-medium text-amber-400">{game.rating || "?"}/5</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 col-span-2">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <FaGamepad className="w-4 h-4" />
                                            <span className="text-xs">Platforms</span>
                                        </div>
                                        <p className="font-medium text-sm truncate">
                                            {game.platforms ? game.platforms.map(p => p.platform.name).join(", ") : "?"}
                                        </p>
                                    </div>
                                </div>

                                {/* Genres */}
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Genres</p>
                                    <div className="flex flex-wrap gap-2">
                                        {game.tags?.slice(0, 6).map((g, i) => (
                                            <span key={i} className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                                                {g.name}
                                            </span>
                                        )) || "?"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Requirements */}
                        {game.platforms?.some(p => p.requirements_en?.minimum) && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h3 className="text-xl font-bold mb-4">System Requirements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <h4 className="text-lg font-semibold mb-3 text-cyan-400">Minimum</h4>
                                        <div className="text-sm text-gray-300">
                                            {parseRequirementsText(game.platforms.find(p => p.requirements_en?.minimum)?.requirements_en?.minimum)}
                                        </div>
                                    </div>
                                    {game.platforms[0].requirements_en?.recommended && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-lg font-semibold mb-3 text-green-400">Recommended</h4>
                                            <div className="text-sm text-gray-300">
                                                {parseRequirementsText(game.platforms.find(p => p.requirements_en?.recommended)?.requirements_en?.recommended)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Reviews Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                                <FaPen className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold">Reviews</h2>
                        </div>

                        {/* Write Review */}
                        {user && (
                            <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                <textarea 
                                    value={newReview} 
                                    onChange={(e) => setNewReview(e.target.value)} 
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 mb-4"
                                    rows="4"
                                    placeholder="Share your thoughts about this game..."
                                />
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Rating:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                className={`text-2xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-gray-600 hover:text-amber-300'}`}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={submitReview}
                                        className="px-6 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-medium"
                                    >
                                        Submit Review
                                    </motion.button>
                                </div>
                                {error && <p className="text-red-400 mt-3">{error}</p>}
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-white">{review.email}</h4>
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-gray-600'}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm whitespace-pre-line">{review.review}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaStar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
}
