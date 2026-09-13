import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchFind from '../src/Features/SearchFind.jsx';
import { makeGame, renderWithRouter } from './helpers.jsx';

const manyGames = (n) => Array.from({ length: n }, (_, i) => makeGame(i + 1));

describe('SearchFind (search results page)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('shows at most 12 games per page', () => {
        renderWithRouter(<SearchFind games={manyGames(30)} />);
        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12);
        expect(screen.getByText('Game 1')).toBeInTheDocument();
        expect(screen.queryByText('Game 13')).not.toBeInTheDocument();
    });

    test('pagination shows the right number of pages and switches page', () => {
        renderWithRouter(<SearchFind games={manyGames(30)} />);

        expect(screen.getByRole('button', { name: 'page 1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Go to page 3' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Go to page 4' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));

        expect(screen.getByText('Game 25')).toBeInTheDocument();
        expect(screen.getByText('Game 30')).toBeInTheDocument();
        expect(screen.queryByText('Game 1')).not.toBeInTheDocument();
    });

    test('a new search result jumps back to page 1', () => {
        const { rerender } = render(<MemoryRouter><SearchFind games={manyGames(30)} /></MemoryRouter>);
        fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
        expect(screen.getByText('Game 25')).toBeInTheDocument();

        rerender(<MemoryRouter><SearchFind games={manyGames(5)} /></MemoryRouter>);

        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
        expect(screen.getByText('Game 1')).toBeInTheDocument();
    });

    test('each card links to the search review page', () => {
        renderWithRouter(<SearchFind games={[makeGame(42)]} />);
        const heading = screen.getByText('Game 42');
        expect(heading.closest('a')).toHaveAttribute('href', '/searchreview/42');
    });

    test('shows the price badge', () => {
        renderWithRouter(<SearchFind games={[makeGame(1, { cheapest: 37 })]} />);
        expect(screen.getByText('$37')).toBeInTheDocument();
    });

    test('uses a placeholder image when the game has no picture', () => {
        renderWithRouter(<SearchFind games={[makeGame(1, { name: 'No Pic', background_image: null })]} />);
        expect(screen.getByAltText('No Pic')).toHaveAttribute('src', 'https://placehold.co/400x225?text=No%20Pic');
    });

    test('shows max 4 platforms, a "+N" chip and truncates long names', () => {
        const platforms = ['PC', 'PlayStation 5', 'Xbox Series S/X', 'Nintendo Switch', 'macOS', 'Linux']
            .map((name, id) => ({ platform: { id, name } }));
        renderWithRouter(<SearchFind games={[makeGame(1, { platforms })]} />);

        expect(screen.getByText('PC')).toBeInTheDocument();
        expect(screen.getByText('PlayStatio...')).toBeInTheDocument();
        expect(screen.getByText('+2')).toBeInTheDocument();
        expect(screen.queryByText('macOS')).not.toBeInTheDocument();
    });

    test('"View Details" opens RAWG in a new tab without following the card link', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        renderWithRouter(<SearchFind games={[makeGame(5, { slug: 'celeste' })]} />);

        const card = screen.getByText('Game 5').closest('a');
        fireEvent.click(within(card).getByRole('link', { name: /View Details/ }));

        expect(open).toHaveBeenCalledWith('https://rawg.io/games/celeste', '_blank', 'noopener,noreferrer');
        expect(screen.getByTestId('location')).toHaveTextContent('/test');
    });

    test('renders without crashing for an empty result list', () => {
        renderWithRouter(<SearchFind games={[]} />);
        expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
        expect(screen.getByText('Back to Home Page')).toBeInTheDocument();
    });
});
