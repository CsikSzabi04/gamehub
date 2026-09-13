import { describe, test, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import GameCard, { releaseYear } from '../src/Components/GameCard.jsx';
import { makeGame, renderWithRouter } from './helpers.jsx';

describe('releaseYear', () => {
    test('returns the year of a date string', () => {
        expect(releaseYear('2015-05-19')).toBe(2015);
    });

    test('returns TBA when there is no date', () => {
        expect(releaseYear(null)).toBe('TBA');
        expect(releaseYear('')).toBe('TBA');
    });

    test('returns the original text when it is not a date', () => {
        expect(releaseYear('Coming soon')).toBe('Coming soon');
    });
});

describe('GameCard', () => {
    test('shows name, year, genre and rating with one decimal', () => {
        renderWithRouter(<GameCard game={makeGame(1, { name: 'Witcher 3', rating: 4.66 })} />);

        expect(screen.getByRole('heading', { name: 'Witcher 3' })).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    test('hides the rating badge when the game has no rating', () => {
        renderWithRouter(<GameCard game={makeGame(1, { rating: 0 })} />);
        expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    });

    test('does not render an <img> without a picture', () => {
        renderWithRouter(<GameCard game={makeGame(1, { background_image: null })} />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('click and Enter call onClick with the game', () => {
        const onClick = vi.fn();
        const game = makeGame(9);
        renderWithRouter(<GameCard game={game} onClick={onClick} />);
        const card = screen.getAllByRole('button')[0];

        fireEvent.click(card);
        fireEvent.keyDown(card, { key: 'Enter' });

        expect(onClick).toHaveBeenCalledTimes(2);
        expect(onClick).toHaveBeenCalledWith(game);
    });

    test('works without an onClick handler', () => {
        renderWithRouter(<GameCard game={makeGame(1)} />);
        expect(() => fireEvent.click(screen.getAllByRole('button')[0])).not.toThrow();
    });

    test('the Reviews link opens the game page and does not trigger the card click', () => {
        const onClick = vi.fn();
        renderWithRouter(<GameCard game={makeGame(77)} onClick={onClick} />);

        const link = screen.getByRole('link', { name: /Reviews/ });
        expect(link).toHaveAttribute('href', '/allreview/77');

        fireEvent.click(link);
        expect(onClick).not.toHaveBeenCalled();
        expect(screen.getByTestId('location')).toHaveTextContent('/allreview/77');
    });
});
