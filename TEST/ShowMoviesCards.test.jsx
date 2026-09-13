import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShowMoviesCards from '../src/FeaturesByGame/Movies/ShowMoviesCards.jsx';
import { UserContext } from '../src/Features/UserContext.jsx';

const movie = {
    id: 1,
    title: 'Inception',
    poster_path: '/abc.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    release_date: '2010-07-16',
    vote_average: 8.364,
    media_type: 'movie',
    adult: false,
    popularity: 83.4567,
    vote_count: 35000,
};

function renderCard(props) {
    return render(
        <UserContext.Provider value={{ user: null }}>
            <ShowMoviesCards closeModal={vi.fn()} modalVisible {...props} />
        </UserContext.Provider>
    );
}

describe('ShowMoviesCards (movie modal)', () => {
    afterEach(() => {
        document.body.style.overflow = '';
    });

    test('renders nothing without a movie', () => {
        const { container } = renderCard({ selectedMovie: null });
        expect(container).toBeEmptyDOMElement();
    });

    test('shows the movie details', () => {
        renderCard({ selectedMovie: movie });
        expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
        expect(screen.getByText('8.4')).toBeInTheDocument();
        expect(screen.getByText('83.46')).toBeInTheDocument();
        expect(screen.getByText('35000')).toBeInTheDocument();
        expect(screen.getByText('Movie')).toBeInTheDocument();
        expect(screen.getByAltText('Inception')).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/abc.jpg');
    });

    test('labels TV shows', () => {
        renderCard({ selectedMovie: { ...movie, media_type: 'tv' } });
        expect(screen.getByText('TV Show')).toBeInTheDocument();
    });

    test('truncates long overviews to 150 characters', () => {
        const overview = 'x'.repeat(200);
        renderCard({ selectedMovie: { ...movie, overview } });
        expect(screen.getByText(`${'x'.repeat(150)}...`)).toBeInTheDocument();
    });

    test('shows the 18+ badge for adult titles', () => {
        renderCard({ selectedMovie: { ...movie, adult: true } });
        expect(screen.getByText('18+')).toBeInTheDocument();
    });

    test('missing overview / popularity / rating do not crash (regression)', () => {
        renderCard({ selectedMovie: { ...movie, overview: undefined, popularity: undefined, vote_average: undefined } });
        expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
        expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    test('locks page scrolling while open and restores it on close', () => {
        const { unmount } = renderCard({ selectedMovie: movie });
        expect(document.body.style.overflow).toBe('hidden');
        unmount();
        expect(document.body.style.overflow).toBe('auto');
    });

    test('the close button calls closeModal', () => {
        const closeModal = vi.fn();
        renderCard({ selectedMovie: movie, closeModal });
        fireEvent.click(screen.getByRole('button'));
        expect(closeModal).toHaveBeenCalledTimes(1);
    });
});
