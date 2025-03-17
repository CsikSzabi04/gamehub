import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext.jsx';
import { Button, TextField, Modal } from '@mui/material';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import './Features.css'

export default function Review() {
    const [allGames, setAllGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [rating, setRating] = useState(0);
    const { user } = useContext(UserContext);

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
        if (!reviewText || rating == 0) return;

        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/submit-review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameId: selectedGame.id,
                    userId: user ? user.uid : "anonymous",
                    email: user ? user.email : "anonymous@domain.com",
                    reviewText,
                    rating,
                    gameName: selectedGame.name,
                }),
            });

            if (response.ok) {
                setReviewText("");
                setRating(0);
                setModalVisible(false);
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
        fetchReviews();
        setSearchTerm(game.name)
        
    };

    const filteredGames = allGames.filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        fetchReviews(); 
    }, []);

    return (
        <>
            <div className='min-h-screen'>
                <Header />
                <div className=" flex flex-col md:flex-row justify-center gap-8 p-8 ">
                    <div className="w-full  min-h-[50%] max-h-[50%] md:w-1/3 bg-gray-800 p-6 rounded-lg shadow-lg ">
                        <h2 className="text-xl font-semibold text-white mb-4">Write a Review</h2>
                        <TextField label="Search Game" variant="outlined" className="mb-4 w-full "sx={{".MuiInputLabel-root": {color:"#0284c7",},".MuiOutlinedInput-root":{input:{color:'white',},fieldset:{border:"1px solid white",},"&:hover fieldset":{border:"1px solid white",},"&.Mui-focused fieldset":{border:"1px solid white",},},}} id="tf" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}  />
                        {searchTerm && (
                            <div className="max-h-40 overflow-y-auto bg-gray-700 p-2 rounded-lg mb-4">
                                {filteredGames.map(game => (
                                    <div key={game.id} className="py-2 text-white cursor-pointer hover:bg-gray-600" onClick={() => showGameDetails(game)}> {game.name}</div>
                                ))}
                            </div>
                        )}

                        <div className='mt-20'>
                            <div className='flex g-5 flex-wrap'>        
                            </div>
                            <TextField className="w-full mb-4 mt-10" label="Write a Review" sx={{".MuiInputLabel-root": {color:"#0284c7",},".MuiOutlinedInput-root":{input:{color:'white',},fieldset:{border:"1px solid white",},"&:hover fieldset":{border:"1px solid white",},"&.Mui-focused fieldset":{border:"1px solid white",},},}} id="tf" multiline rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)}/>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className={`cursor-pointer text-xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => setRating(star)} >★ </span>
                                ))}
                            </div>
                            <Button onClick={handleReviewSubmit} variant="contained" color="primary" fullWidth> Submit Review </Button>
                        </div>
                    </div>

                    <div className="w-full min-h-screen md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviews.length > 0 ? (
                                reviews.map((review, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between">
                                        <h3 className="text-white font-semibold">{review.gameName}</h3>
                                        <h4 className="text-white font-semibold">{review.email}</h4>
                                        <div className="flex items-center mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-400'}`}  >  ★ </span>
                                            ))}
                                        </div>
                                        <p className="text-white">{review.review}</p>
                                    </div>
                                ))
                            ) : ( <p className="text-white">No reviews yet.</p>)}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
