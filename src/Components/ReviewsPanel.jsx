import React from 'react';
import { Link } from 'react-router-dom';
import { BsStarFill, BsChatSquareText } from 'react-icons/bs';

function Stars({ value, size = 'text-sm' }) {
    return (
        <div className={`flex gap-0.5 ${size}`} aria-label={`${value} out of 5`}>
            {[...Array(5)].map((_, i) => (
                <BsStarFill key={i} className={i < value ? 'text-amber-400' : 'text-[#2a2e38]'} />
            ))}
        </div>
    );
}

function initials(email = '') {
    return (email.trim()[0] || '?').toUpperCase();
}

export default function ReviewsPanel({ user, reviews, newReview, setNewReview, rating, setRating, onSubmit, error }) {
    const average = reviews.length
        ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
                <h3 className="gh-section-title">Reviews</h3>
                {average && (
                    <span className="text-sm text-[#a1a6b3]">
                        <span className="font-semibold text-white">{average}</span> avg · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                )}
            </div>

            {user ? (
                <div className="gh-surface p-4 sm:p-5 mb-4">
                    <label htmlFor="review-text" className="block text-sm font-semibold text-white mb-3">Write a review</label>
                    <textarea
                        id="review-text"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="gh-input resize-none mb-4"
                        rows="4"
                        placeholder="What did you think about this game?"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-sm text-[#a1a6b3]">Your rating</span>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                        onClick={() => setRating(star)}
                                        className={`p-1.5 sm:p-1 text-2xl sm:text-xl leading-none transition-colors ${rating >= star ? 'text-amber-400' : 'text-[#2a2e38] hover:text-amber-300/70'}`}
                                    >
                                        <BsStarFill />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="button" onClick={onSubmit} className="gh-btn gh-btn-primary !h-11 sm:!h-10 w-full sm:w-auto">
                            Post review
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
                </div>
            ) : (
                <div className="gh-surface px-4 sm:px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm">Sign in to share your opinion about this game.</p>
                    <Link to="/login" className="gh-btn gh-btn-secondary w-full sm:w-auto">Log in</Link>
                </div>
            )}

            {reviews.length > 0 ? (
                <ul className="gh-surface divide-y divide-white/[0.06]">
                    {reviews.map((review, index) => (
                        <li key={review.id || index} className="p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1e222c] text-sm font-semibold text-[#c4b5fd]">
                                    {initials(review.email)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                        <p className="truncate text-sm font-medium text-white">{review.email}</p>
                                        <Stars value={review.rating} size="text-xs" />
                                    </div>
                                    {review.createdAt && (
                                        <p className="text-xs text-[#6b7080] mt-0.5">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm leading-relaxed text-[#c9ccd4] whitespace-pre-line">{review.review}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="gh-surface flex flex-col items-center py-12 text-center">
                    <BsChatSquareText className="h-6 w-6 text-[#3a3f4b] mb-3" />
                    <p className="text-sm">No reviews yet. Be the first to write one.</p>
                </div>
            )}
        </div>
    );
}
