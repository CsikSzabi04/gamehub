import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../Features/UserContext.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { FaArrowLeftLong } from 'react-icons/fa6';

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
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white">Loading game details...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (error && !game) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white">{error}</div>
                </div>
                <Footer />
            </>
        );
    }

    if (!game) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-white">Game not found</div>
                </div>
                <Footer />
            </>
        );
    }

    function parseRequirementsText(text) {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const cleanLine = line.replace(/<[^>]*>/g, '').trim();

            if (line.includes('<li>')) {
                return (
                    <div key={index} style={{ display: 'flex', marginBottom: '4px' }}>
                        <span style={{ marginRight: '8px' }}>•</span>
                        <span>{cleanLine}</span>
                    </div>
                );
            }

            if (line.includes('<strong>')) {
                return (
                    <div key={index} style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        <strong>{cleanLine}</strong>
                    </div>
                );
            }

            return (
                <div key={index} style={{ marginBottom: '8px' }}>
                    {cleanLine}
                </div>
            );
        });
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-cover bg-center text-white p-4 sm:p-8" style={{ backgroundImage: `url(${game.background_image})` }}>
                <div className="max-w-6xl mx-auto">

                    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-wrap gap-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/3">
                                    <img src={game.background_image} alt={game.name} className="w-full h-auto rounded-lg object-cover" />
                                    <Link to="/" className="group mb-6 mt-10 inline-flex items-center px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 transform-gpu">
                                        <FaArrowLeftLong className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                                        <span className="relative overflow-hidden">
                                            <span className="block transition-transform duration-300 group-hover:-translate-y-[110%]">
                                                Back to Home Page
                                            </span>
                                            <span className="absolute inset-0 block translate-y-[110%] transition-transform duration-300 group-hover:translate-y-0">
                                                Take Me Back!
                                            </span>
                                        </span>
                                    </Link>
                                </div>
                                <div className="md:w-2/3">
                                    <div className="flex justify-between items-start">
                                        <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
                                        {fav ? (<button onClick={delFav} className=" hover:bg-red-700 px-4 py-2 rounded-md close-button">Remove from Favorites</button>) : (<button onClick={addFav} className=" hover:bg-green-700 px-4 py-2 rounded-md add-button">Add to Favorites</button>)}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-gray-400">Release Date</p>
                                            <p>{game.released || "?"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Rating</p>
                                            <p>{game.rating || "?"}/5</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Platforms</p>
                                            <p>{game.platforms ? game.platforms.map(p => p.platform.name).join(", ") : "?"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Genres</p>
                                            <div className="flex flex-wrap gap-1">
                                                {game.tags?.map((g, i) => (
                                                    <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">{g.name} </span>)) || "?"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {game.platforms?.some(p => p.requirements_en?.minimum) && (
                                <div className="mb-6 ">
                                    <h3 className="text-xl font-bold mb-4">System Requirements</h3>
                                    <div className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3 text-blue-400">Minimum:</h4>
                                            <div className="text-gray-300 text-sm space-y-2">
                                                {parseRequirementsText(game.platforms.find(p => p.requirements_en?.minimum)?.requirements_en?.minimum)}
                                            </div>
                                        </div>
                                        {game.platforms[0].requirements_en?.recommended && (
                                            <div>
                                                <h4 className="text-lg font-semibold mb-3 text-green-400">Recommended:</h4>
                                                <div className="text-gray-300 text-sm space-y-2">
                                                    {parseRequirementsText(game.platforms.find(p => p.requirements_en?.recommended)?.requirements_en?.recommended)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-6 ">
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                        {user && (
                            <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded p-3 mb-4" rows="4" placeholder="Share your thoughts about this game..." />
                                <div className="flex items-center mb-4">
                                    <span className="mr-2">Rating:</span>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => setRating(star)}>★ </button>))}
                                </div>
                                <button onClick={submitReview} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"> Submit Review</button>
                                {error && <p className="text-red-500 mt-2">{error}</p>}
                            </div>
                        )}

                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">{review.email}</h4>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (<span key={i} className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-400'}`} > ★</span>))}
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-line">{review.review}</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-gray-400">No reviews yet. Be the first to review!</p>)}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}