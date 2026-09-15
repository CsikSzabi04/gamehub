import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsChatSquareText } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Spinner } from '../community/ui.jsx';
import { Stars, StarInput } from '../reviews/Stars.jsx';
import ReviewSummary from '../reviews/ReviewSummary.jsx';
import ReviewCard from '../reviews/ReviewCard.jsx';
import ReviewForm from '../reviews/ReviewForm.jsx';
import ReportReviewModal from '../reviews/ReportReviewModal.jsx';
import { SORTS } from '../reviews/reviewUtils.js';

function SignInCard() {
    const { t } = useT();
    return (
        <div className="gh-surface px-4 sm:px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm">{t('reviewsPlus.signInText')}</p>
            <Link to="/login" className="gh-btn gh-btn-secondary w-full sm:w-auto">{t('reviewsPlus.login')}</Link>
        </div>
    );
}

function EmptyReviews() {
    const { t } = useT();
    return (
        <div className="gh-surface flex flex-col items-center py-12 px-4 text-center">
            <BsChatSquareText className="h-6 w-6 text-[#3a3f4b] mb-3" aria-hidden="true" />
            <p className="text-sm">{t('reviewsPlus.empty')}</p>
        </div>
    );
}

/** Full reviews section driven by the useGameCommunity() result. */
function CommunityReviews({ community }) {
    const { t } = useT();
    const formRef = useRef(null);
    const [reportTarget, setReportTarget] = useState(null);
    const {
        user, reviews, summary, sort, setSort, hasMore, loadMore, loadingReviews, loadingMore, loadError,
        legacyBackend, vote, report, remove, myVotes, startEdit, editingId, actionError,
    } = community;

    const interactive = !legacyBackend;
    const count = summary?.count ?? reviews.length;

    function edit(review) {
        startEdit(review);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
                <h3 className="gh-section-title">{t('reviewsPlus.title')}</h3>
                {count > 0 && <span className="text-sm text-[#a1a6b3]">{t('reviewsPlus.reviewCount', { count })}</span>}
            </div>

            <ReviewSummary summary={summary} />

            <div ref={formRef} className="scroll-mt-24">
                {user ? <ReviewForm key={editingId || 'new'} community={community} /> : <SignInCard />}
            </div>

            {reviews.length > 1 || (hasMore && reviews.length > 0) ? (
                <div className="mb-3 flex items-center justify-end gap-2">
                    <label htmlFor="reviews-sort" className="text-xs text-[#a1a6b3]">{t('reviewsPlus.sortLabel')}</label>
                    <select
                        id="reviews-sort"
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        className="h-9 rounded-lg bg-[#0a0b0f] border border-white/[0.1] px-2.5 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
                    >
                        {SORTS.map(value => <option key={value} value={value}>{t(`reviewsPlus.sort.${value}`)}</option>)}
                    </select>
                </div>
            ) : null}

            {(actionError || loadError) && <p className="text-sm text-red-400 mb-3" role="alert">{actionError || loadError}</p>}

            {loadingReviews && reviews.length === 0 ? (
                <Spinner className="py-10" />
            ) : reviews.length > 0 ? (
                <div className={`space-y-3 transition-opacity ${loadingReviews ? 'opacity-60' : ''}`}>
                    {reviews.map(review => {
                        const isOwn = Boolean(user && review.userId === user.uid);
                        return (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isOwn={isOwn}
                                voted={myVotes.includes(String(review.id))}
                                onVote={interactive ? vote : undefined}
                                onReport={interactive && user ? setReportTarget : undefined}
                                onEdit={interactive && isOwn ? edit : undefined}
                                onDelete={interactive && isOwn ? remove : undefined}
                            />
                        );
                    })}
                </div>
            ) : (
                !loadError && <EmptyReviews />
            )}

            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <button type="button" onClick={loadMore} disabled={loadingMore} className="gh-btn gh-btn-secondary w-full sm:w-auto">
                        {t('reviewsPlus.loadMore')}
                    </button>
                </div>
            )}

            <ReportReviewModal
                key={reportTarget?.id || 'none'}
                open={Boolean(reportTarget)}
                onClose={() => setReportTarget(null)}
                onSubmit={reason => report(reportTarget.id, reason)}
            />
        </div>
    );
}

/** Simple list + form (props passed one by one, the original API). */
function BasicReviews({ user, reviews = [], newReview, setNewReview, rating, setRating, onSubmit, error }) {
    const { t, locale } = useT();
    const one = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const average = reviews.length
        ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
        : null;

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
                <h3 className="gh-section-title">{t('reviewsPlus.title')}</h3>
                {average != null && (
                    <span className="text-sm text-[#a1a6b3]">
                        <span className="font-semibold text-white">{one.format(average)}</span> {t('reviewsPlus.avgShort')} · {t('reviewsPlus.reviewCount', { count: reviews.length })}
                    </span>
                )}
            </div>

            {user ? (
                <div className="gh-surface p-4 sm:p-5 mb-4">
                    <label htmlFor="review-text" className="block text-sm font-semibold text-white mb-3">{t('reviewsPlus.writeTitle')}</label>
                    <textarea
                        id="review-text"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="gh-input resize-none mb-4"
                        rows="4"
                        placeholder={t('reviewsPlus.placeholder')}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="text-sm text-[#a1a6b3]">{t('reviewsPlus.yourRating')}</span>
                            <StarInput value={rating} onChange={setRating} label={t('reviewsPlus.yourRating')} />
                        </div>
                        <button type="button" onClick={onSubmit} className="gh-btn gh-btn-primary !h-11 sm:!h-10 w-full sm:w-auto">
                            {t('reviewsPlus.post')}
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
                </div>
            ) : (
                <SignInCard />
            )}

            {reviews.length > 0 ? (
                <ul className="gh-surface divide-y divide-white/[0.06]">
                    {reviews.map((review, index) => {
                        const name = review.username || t('reviewsPlus.player');
                        return (
                            <li key={review.id || index} className="p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1e222c] text-sm font-semibold text-[#c4b5fd]" aria-hidden="true">
                                        {(name.trim()[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                            <p className="truncate text-sm font-medium text-white">{name}</p>
                                            <Stars value={review.rating} className="text-xs" />
                                        </div>
                                        {review.createdAt && (
                                            <p className="text-xs text-[#6b7080] mt-0.5">
                                                {new Date(review.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        )}
                                        <p className={`mt-2 text-sm leading-relaxed text-[#c9ccd4] whitespace-pre-line break-words ${review.spoiler ? 'blur-sm hover:blur-none' : ''}`}>{review.review}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <EmptyReviews />
            )}
        </div>
    );
}

/**
 * Game page reviews.
 * Pass `community={useGameCommunity(...)}` for the full experience (summary, sorting, details, helpful votes,
 * reports, edit/delete). The individual props (user, reviews, newReview, ...) keep working without it.
 */
export default function ReviewsPanel({ community, ...props }) {
    if (community) return <CommunityReviews community={community} />;
    return <BasicReviews {...props} />;
}
