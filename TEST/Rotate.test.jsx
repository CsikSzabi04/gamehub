import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Rotate from '../src/Rotate/Rotate.jsx';
import { makeGame, renderWithRouter } from './helpers.jsx';

const games = [1, 2, 3, 4, 5].map(id => makeGame(id));

function track(container) {
    return container.querySelector('[style*="translateX"]');
}

function setWidth(width) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
}

describe('Rotate (game carousel)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setWidth(1024); // md breakpoint -> 300px card + 16px gap
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('renders the title and every game twice (for the endless loop)', () => {
        renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="Action games" intervalTimeA={5000} />);

        expect(screen.getByRole('heading', { level: 2, name: 'Action games' })).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 3, name: 'Game 1' })).toHaveLength(2);
    });

    test('starts at the first card', () => {
        const { container } = renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="A" intervalTimeA={5000} />);
        expect(track(container).style.transform).toBe('translateX(-0px)');
    });

    test('auto-rotates by two cards every interval and wraps around', () => {
        const { container } = renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="A" intervalTimeA={5000} />);

        act(() => { vi.advanceTimersByTime(5000); });
        expect(track(container).style.transform).toBe('translateX(-632px)'); // index 2

        act(() => { vi.advanceTimersByTime(5000); });
        expect(track(container).style.transform).toBe('translateX(-1264px)'); // index 4

        act(() => { vi.advanceTimersByTime(5000); });
        expect(track(container).style.transform).toBe('translateX(-316px)'); // (4 + 2) % 5 = 1
    });

    test('next / previous buttons move one card and wrap', () => {
        const { container } = renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="Sci-fi" intervalTimeA={60000} />);

        fireEvent.click(screen.getByRole('button', { name: 'Next Sci-fi' }));
        expect(track(container).style.transform).toBe('translateX(-316px)');

        fireEvent.click(screen.getByRole('button', { name: 'Previous Sci-fi' }));
        fireEvent.click(screen.getByRole('button', { name: 'Previous Sci-fi' }));
        expect(track(container).style.transform).toBe('translateX(-1264px)'); // wrapped to index 4
    });

    test('an empty list never produces NaN (regression)', () => {
        const { container } = renderWithRouter(<Rotate games={[]} showGameDetails={vi.fn()} name="Empty" intervalTimeA={1000} />);

        act(() => { vi.advanceTimersByTime(10000); });
        fireEvent.click(screen.getByRole('button', { name: 'Next Empty' }));
        fireEvent.click(screen.getByRole('button', { name: 'Previous Empty' }));

        expect(track(container).style.transform).not.toContain('NaN');
    });

    test('keeps working when the games arrive later', () => {
        const { container, rerender } = render(<MemoryRouter><Rotate games={[]} showGameDetails={vi.fn()} name="Late" intervalTimeA={1000} /></MemoryRouter>);
        act(() => { vi.advanceTimersByTime(5000); });

        rerender(<MemoryRouter><Rotate games={games} showGameDetails={vi.fn()} name="Late" intervalTimeA={1000} /></MemoryRouter>);
        act(() => { vi.advanceTimersByTime(1000); });

        expect(track(container).style.transform).toBe('translateX(-632px)');
    });

    test('uses the smaller step on phones and updates on resize', () => {
        setWidth(400);
        const { container } = renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="Phone" intervalTimeA={60000} />);

        fireEvent.click(screen.getByRole('button', { name: 'Next Phone' }));
        expect(track(container).style.transform).toBe('translateX(-236px)');

        act(() => {
            setWidth(700);
            window.dispatchEvent(new Event('resize'));
        });
        expect(track(container).style.transform).toBe('translateX(-276px)');
    });

    test('clicking a card opens the game details', () => {
        const showGameDetails = vi.fn();
        renderWithRouter(<Rotate games={games} showGameDetails={showGameDetails} name="A" intervalTimeA={60000} />);

        fireEvent.click(screen.getAllByRole('heading', { level: 3, name: 'Game 3' })[0]);

        expect(showGameDetails).toHaveBeenCalledWith(games[2]);
    });

    test('clears its timer on unmount', () => {
        const clearSpy = vi.spyOn(globalThis, 'clearInterval');
        const { unmount } = renderWithRouter(<Rotate games={games} showGameDetails={vi.fn()} name="A" intervalTimeA={5000} />);
        unmount();
        expect(clearSpy).toHaveBeenCalled();
    });
});
