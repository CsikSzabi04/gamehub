import { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext.jsx';
import { API_BASE } from '../Components/apiCache.js';

/**
 * GameDataHub reviews + favorites for one game.
 * gameId can be a RAWG id (12020) or a store key ("steam-730", "gog-1207658924").
 */
export default function useGameCommunity(gameId, gameName) {
    const { user } = useContext(UserContext) || {};
    const [reviews, setReviews] = useState([]);
    const [reviewsVersion, setReviewsVersion] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [reviewError, setReviewError] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [favError, setFavError] = useState('');

    useEffect(() => {
        if (!gameId) return;
        let active = true;
        fetch(`${API_BASE}/get-all-reviews`)
            .then(res => res.json())
            .then(data => {
                if (active) setReviews(Array.isArray(data) ? data.filter(r => String(r.gameId) === String(gameId)) : []);
            })
            .catch(err => console.error('Failed to fetch reviews:', err));
        return () => { active = false; };
    }, [gameId, reviewsVersion]);

    useEffect(() => {
        if (!user?.uid) {
            setFavorites([]);
            return;
        }
        let active = true;
        fetch(`${API_BASE}/getFav?userId=${encodeURIComponent(user.uid)}`)
            .then(res => res.json())
            .then(data => { if (active) setFavorites(Array.isArray(data) ? data : []); })
            .catch(err => console.error('Failed to fetch favorites:', err));
        return () => { active = false; };
    }, [user?.uid]);

    const isFavorite = favorites.some(f => String(f.gameId) === String(gameId));

    async function addFavorite() {
        if (!user) {
            setFavError('You must log in to add favorites.');
            return;
        }
        setFavError('');
        const favData = { name: gameName, gameId, userId: user.uid };
        try {
            const resp = await fetch(`${API_BASE}/addfav`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(favData),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            setFavorites(prev => [...prev, { gameId, name: gameName }]);
        } catch {
            setFavError('Failed to add to favorites.');
        }
    }

    async function removeFavorite() {
        if (!user) return;
        setFavError('');
        try {
            const resp = await fetch(`${API_BASE}/delfav/${encodeURIComponent(gameId)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            setFavorites(prev => prev.filter(f => String(f.gameId) !== String(gameId)));
        } catch {
            setFavError('Failed to delete from favorites.');
        }
    }

    async function submitReview() {
        if (!newReview.trim() || rating === 0) {
            setReviewError('Please write a review and select a rating');
            return;
        }
        try {
            const resp = await fetch(`${API_BASE}/submit-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    userId: user ? user.uid : 'anonymous',
                    email: user ? user.email : 'anonymous@domain.com',
                    reviewText: newReview,
                    rating,
                    gameName,
                }),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            setReviewError('');
            setNewReview('');
            setRating(0);
            setReviewsVersion(v => v + 1);
        } catch (err) {
            console.error('Error submitting review:', err);
            setReviewError('Failed to submit review');
        }
    }

    return {
        user,
        reviews,
        newReview,
        setNewReview,
        rating,
        setRating,
        submitReview,
        reviewError,
        isFavorite,
        addFavorite,
        removeFavorite,
        favError,
    };
}
