import { describe, test, expect, afterEach, vi } from 'vitest';
import { searchRawgGames } from '../src/Features/Search.jsx';
import { jsonResponse, mockFetch } from './helpers.jsx';

describe('searchRawgGames', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('URL-encodes the query', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse({ results: [] })));

        await searchRawgGames('Tom & Jerry #2');

        const url = fetch.mock.calls[0][0];
        expect(url).toContain('search=Tom%20%26%20Jerry%20%232');
        expect(url.startsWith('https://api.rawg.io/api/games?')).toBe(true);
    });

    test('maps RAWG results to the fields the UI uses', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        mockFetch(() => Promise.resolve(jsonResponse({
            results: [
                { id: 7, name: 'Portal', background_image: 'p.jpg', rating: 4.5, esrb_rating: { name: 'Teen' } },
                { id: 8, name: 'Unrated', background_image: null, esrb_rating: null },
            ],
        })));

        const games = await searchRawgGames('portal');

        expect(games).toHaveLength(2);
        expect(games[0]).toMatchObject({
            id: 7,
            name: 'Portal',
            external: 'Portal',
            thumb: 'p.jpg',
            gameID: 7,
            rating: 4.5,
            esrb_rating: 'Teen',
            cheapest: 60, // floor(0.5 * 100) + 10
        });
        expect(games[1].esrb_rating).toBe('Not rated');
    });

    test('filters out games above the max price', async () => {
        // First game gets price 10, second gets 109
        vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0).mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.999).mockReturnValueOnce(0.2);
        mockFetch(() => Promise.resolve(jsonResponse({ results: [{ id: 1, name: 'Cheap' }, { id: 2, name: 'Pricey' }] })));

        const games = await searchRawgGames('x', 50);

        expect(games.map(g => g.name)).toEqual(['Cheap']);
    });

    test('returns an empty list when RAWG sends no results field', async () => {
        mockFetch(() => Promise.resolve(jsonResponse({ detail: 'nothing' })));
        await expect(searchRawgGames('zzz')).resolves.toEqual([]);
    });

    test('throws when RAWG answers with an HTTP error', async () => {
        mockFetch(() => Promise.resolve(jsonResponse({}, { ok: false, status: 401 })));
        await expect(searchRawgGames('x')).rejects.toThrow('RAWG request failed: 401');
    });

    test('propagates network errors', async () => {
        mockFetch(() => Promise.reject(new Error('offline')));
        await expect(searchRawgGames('x')).rejects.toThrow('offline');
    });
});
