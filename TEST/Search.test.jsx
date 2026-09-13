import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import Search from '../src/Features/Search.jsx';
import { jsonResponse, mockFetch, renderWithRouter } from './helpers.jsx';

const rawgResults = { results: [{ id: 1, name: 'Hades' }, { id: 2, name: 'Hollow Knight' }] };

function typeInto(input, value) {
    fireEvent.change(input, { target: { value } });
}

describe('Search component (on the home page, with setGames)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(Math, 'random').mockReturnValue(0); // price 10, always under the 500 limit
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('renders the search input', () => {
        renderWithRouter(<Search setGames={vi.fn()} setSearchTrue={vi.fn()} />);
        expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
    });

    test('searches automatically 500ms after typing (debounced)', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        const setGames = vi.fn();
        const setSearchTrue = vi.fn();
        renderWithRouter(<Search setGames={setGames} setSearchTrue={setSearchTrue} />);

        typeInto(screen.getByPlaceholderText('Search games...'), 'ha');
        await act(async () => { vi.advanceTimersByTime(400); });
        expect(fetch).not.toHaveBeenCalled();

        await act(async () => { await vi.advanceTimersByTimeAsync(200); });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(setGames).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Hades' })]));
        expect(setSearchTrue).toHaveBeenCalledWith(true);
    });

    test('only the last keystroke triggers a request', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        renderWithRouter(<Search setGames={vi.fn()} setSearchTrue={vi.fn()} />);
        const input = screen.getByPlaceholderText('Search games...');

        typeInto(input, 'ha');
        await act(async () => { vi.advanceTimersByTime(300); });
        typeInto(input, 'had');
        await act(async () => { vi.advanceTimersByTime(300); });
        typeInto(input, 'hade');
        await act(async () => { await vi.advanceTimersByTimeAsync(600); });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toContain('search=hade');
    });

    test('does not auto-search for a single character', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        renderWithRouter(<Search setGames={vi.fn()} />);

        typeInto(screen.getByPlaceholderText('Search games...'), 'h');
        await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

        expect(fetch).not.toHaveBeenCalled();
    });

    test('Enter searches immediately', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        const setGames = vi.fn();
        renderWithRouter(<Search setGames={setGames} />);
        const input = screen.getByPlaceholderText('Search games...');

        typeInto(input, 'x');
        await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(setGames).toHaveBeenCalled();
    });

    test('Enter with only spaces does nothing', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        renderWithRouter(<Search setGames={vi.fn()} />);
        const input = screen.getByPlaceholderText('Search games...');

        typeInto(input, '   ');
        await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });

        expect(fetch).not.toHaveBeenCalled();
    });

    test('shows an error message when the request fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetch(() => Promise.reject(new Error('offline')));
        const setGames = vi.fn();
        renderWithRouter(<Search setGames={setGames} />);
        const input = screen.getByPlaceholderText('Search games...');

        typeInto(input, 'zelda');
        await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });

        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
        expect(setGames).not.toHaveBeenCalled();
    });
});

describe('Search component (on other pages, without setGames)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Enter navigates to the home page with the query in router state', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse(rawgResults)));
        renderWithRouter(<Search />, { route: '/review', path: '/review' });
        const input = screen.getByPlaceholderText('Search games...');

        typeInto(input, '  elden ring ');
        await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });

        expect(screen.getByTestId('location')).toHaveTextContent('/|{"search":"elden ring"}');
        expect(fetch).not.toHaveBeenCalled();
    });

    test('typing alone does not navigate away', async () => {
        vi.useFakeTimers();
        renderWithRouter(<Search />, { route: '/review', path: '/review' });

        typeInto(screen.getByPlaceholderText('Search games...'), 'elden');
        await act(async () => { vi.advanceTimersByTime(2000); });

        expect(screen.getByTestId('location')).toHaveTextContent('/review');
        vi.useRealTimers();
    });
});
