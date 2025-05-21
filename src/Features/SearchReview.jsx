import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { FaArrowLeftLong } from 'react-icons/fa6';

export default function SearchReview() {
    const { gameId } = useParams();
    const { user } = useContext(UserContext);
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGame() {
            try {
                const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=984255fceb114b05b5e746dc24a8520a`);
                const data = await response.json();
                setGame(data);

                const slugResponse = await fetch(`https://api.rawg.io/api/games/${data.slug}?key=984255fceb114b05b5e746dc24a8520a`);
                const slugData = await slugResponse.json();
                if (slugData.platforms) {
                    const pcData = slugData.platforms.find(p => p.platform.slug == 'pc');
                    if (pcData?.requirements?.minimum) {
                        setGame(prev => ({ ...prev, requirements: pcData.requirements }));
                    }
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

    async function submitReview() {
        if (!newReview || rating == 0) {
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
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white">Loading game details...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !game) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white">{error || "Game not found"}</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-cover bg-center text-white p-4 sm:p-6 md:p-10" style={{ backgroundImage: `url(${game.background_image})` }}>
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-2xl p-6 md:p-10 mb-10 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <img src={game.background_image} alt={game.name} className="w-full rounded-2xl object-cover shadow-lg" />
                                <Link to="/" className="group mt-6 inline-flex items-center px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 transform-gpu">
                                    <FaArrowLeftLong className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                                    <span className="relative overflow-hidden">
                                        <span className="block transition-transform duration-300 group-hover:-translate-y-[110%]">Back to Search Results</span>
                                        <span className="absolute inset-0 block translate-y-[110%] transition-transform duration-300 group-hover:translate-y-0">Take Me Back!</span>
                                    </span>
                                </Link>
                            </div>
                            <div className="md:w-2/3">
                                <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-gray-400 text-sm">Release Date</p>
                                        <p>{game.released}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Rating</p>
                                        <p>{game.rating} / 5</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Platforms</p>
                                        <p>{game.platforms?.map(p => p.platform.name).join(", ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Genres</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {game.genres?.map((g, i) => (
                                                <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-xs">{g.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-gray-400 text-sm">Stores</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {game.stores?.map(({ store }) => (
                                                <a key={store.id} href={`https://${store.slug}.com`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm hover:text-blue-300 transition">{store.name}</a>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">ESRB Rating</p>
                                        <p>{game.esrb_rating?.name}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-gray-400 text-sm">Tags</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {game.tags?.slice(0, 10).map(tag => (
                                                <span key={tag.id} className="bg-gray-700 px-2 py-1 rounded text-xs">{tag.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {game.requirements?.minimum && (
                                        <div className="sm:col-span-2">
                                            <p className="text-gray-400 text-sm">Minimum Requirements (PC)</p>
                                            <pre className="bg-gray-700 p-2 rounded text-sm whitespace-pre-wrap">{game.requirements.minimum}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-2xl p-6 md:p-10">
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                        {user && (
                            <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                <textarea value={newReview} onChange={e => setNewReview(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded p-3 mb-4" rows="4" placeholder="Share your thoughts about this game..." />
                                <div className="flex items-center mb-4">
                                    <span className="mr-2">Rating:</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => setRating(star)}>★</button>
                                    ))}
                                </div>
                                <button onClick={submitReview} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition">Submit Review</button>
                                {error && <p className="text-red-500 mt-2">{error}</p>}
                            </div>
                        )}
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">{review.email}</h4>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-400'}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-line">{review.review}</p>
                                        <p className="text-gray-400 text-sm mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>

    );
}
