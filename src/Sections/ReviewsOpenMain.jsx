import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

export default function ReviewsOpenMain({ allGames, showGameDetails }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/get-all-reviews');
                const data = await response.json();
                setReviews(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    if (loading) return <div className="text-white text-center py-4">Loading reviews...</div>;
    if (reviews.length == 0) return null;

    const uniqueGameIds = [];
    reviews.forEach(review => {
        if (!uniqueGameIds.includes(review.gameId)) {
            uniqueGameIds.push(review.gameId);
        }
    });

    const reviewedGames = [];
    for (let i = 0; i < uniqueGameIds.length; i++) {
        const gameId = uniqueGameIds[i];
        const game = allGames.find(game => game.id == gameId);
        if (game) {
            const gameReviews = reviews.filter(review => review.gameId == gameId);
            reviewedGames.push({ ...game,  reviews: gameReviews  });}
    }

    const finalReviewedGames = reviewedGames.slice(0, 5);
    return (
        <section className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className='flex flex-wrap'><h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Community Reviews <Link to="/review"><button className='text-xs sm:text-xs transition-all duration-200 hover:text-blue-300'><FaExternalLinkAlt /></button></Link></h2></div> 
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {finalReviewedGames.map((game, index) => (
            <div key={game.id} className={`bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${ index == 0 ? 'xs:col-span-2 md:col-span-1 lg:col-span-2 lg:row-span-2' : '' }`}>
              {index == 0 ? (
                <div className="relative h-48 sm:h-56 md:h-64">
                  <img src={game.background_image} alt={game.name} className="w-full h-full object-cover cursor-pointer hover:scale-104 transition-transform duration-300"onClick={() => showGameDetails(game)}  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white ">{game.name}</h3>
                    <div className="flex items-center mt-1 sm:mt-2">
                      {[...Array(5)].map((_, i) => ( <span key={i} className={`text-sm sm:text-base ${i < Math.floor(game.reviews[0].rating) ? 'text-yellow-400' : 'text-gray-400'}`} >★</span>))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 justify-items-center ">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{game.name}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {game.reviews.slice(0, 2).map(review => (
                      <div key={review.id} className="bg-gray-700 p-2 sm:p-3 rounded">
                        <div className="flex items-center mb-1">
                          <span className="text-xs sm:text-sm font-medium">{review.email}</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => ( <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-400'}`} >   ★ </span>))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
}