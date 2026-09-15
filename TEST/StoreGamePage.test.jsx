import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Keep the page test focused: no real header/footer network calls
vi.mock('../src/Header.jsx', () => ({ default: () => null }));
vi.mock('../src/Footer.jsx', () => ({ default: () => null }));

import StoreGamePage, {
    storeGameKey, normalizeTitle, titleMatch, sameRelease, pickRawgMatch, normalizeRequirements, findCachedItem,
} from '../src/Features/StoreGamePage.jsx';
import AllReview from '../src/Features/AllReview.jsx';
import useStoreItem from '../src/Hub/useStoreItem.jsx';
import { UserContext } from '../src/Features/UserContext.jsx';
import { jsonResponse, mockFetch, LocationProbe } from './helpers.jsx';

const API = 'https://gamehub-backend-zekj.onrender.com';

describe('StoreGamePage helpers', () => {
    test('storeGameKey builds the review/favorite id', () => {
        expect(storeGameKey('steam', 730)).toBe('steam-730');
        expect(storeGameKey('gog', '1207658964')).toBe('gog-1207658964');
    });

    test('normalizeTitle ignores case, symbols and trademarks', () => {
        expect(normalizeTitle('Apex Legends™')).toBe('apexlegends');
        expect(normalizeTitle('Overwatch®')).toBe('overwatch');
        expect(normalizeTitle(undefined)).toBe('');
    });

    test('pickRawgMatch prefers an exact title match', () => {
        const results = [{ id: 1, name: 'Ys IX: Monstrum Nox' }, { id: 2, name: 'Nox' }];
        expect(pickRawgMatch(results, 'Nox™').id).toBe(2);
    });

    test('titleMatch: exact, close, or no match (regression: "Nox" vs "Nox Archaist")', () => {
        expect(titleMatch('Nox™', 'NOX')).toBe('exact');
        expect(titleMatch('Overwatch 2', 'Overwatch®')).toBe('close');
        expect(titleMatch('Nox Archaist', 'Nox™')).toBeNull();
        expect(titleMatch('', 'Nox')).toBeNull();
    });

    test('sameRelease compares years only when both dates are known', () => {
        expect(sameRelease('Sep 10, 2026', '2026-09-10')).toBe(true);
        expect(sameRelease('2025-12-30', '2026-01-02')).toBe(true);
        expect(sameRelease('2019-03-01', 'Sep 10, 2026')).toBe(false);
        expect(sameRelease(null, '2026-01-01')).toBe(true);
        expect(sameRelease('TBA', '2026-01-01')).toBe(true);
    });

    test('pickRawgMatch skips a same-named game from another year (regression: WARDOGS)', () => {
        const results = [{ id: 1, name: 'WARDOGS', released: '2019-05-01' }, { id: 2, name: 'Wardogs', released: '2026-09-10' }];
        expect(pickRawgMatch(results, 'WARDOGS', 'Sep 10, 2026').id).toBe(2);
        expect(pickRawgMatch([results[0]], 'WARDOGS', 'Sep 10, 2026')).toBeNull();
        expect(pickRawgMatch([results[0]], 'WARDOGS')).toEqual(results[0]);
    });

    test('pickRawgMatch accepts close prefixes but rejects unrelated games', () => {
        expect(pickRawgMatch([{ id: 3, name: 'Overwatch 2' }], 'Overwatch®').id).toBe(3);
        expect(pickRawgMatch([{ id: 4, name: 'Steam Machine Simulator Deluxe' }], 'Steam Machine')).toBeNull();
        expect(pickRawgMatch([{ id: 5, name: 'Nox Dei' }], 'Nox')).toBeNull();
        expect(pickRawgMatch(undefined, 'Nox')).toBeNull();
    });

    test('normalizeRequirements fixes Steam "OS *:" labels and drops empty data', () => {
        expect(normalizeRequirements({ minimum: '<li><strong>OS *:</strong> Windows 10</li>', recommended: null }))
            .toEqual({ minimum: '<li><strong>OS:</strong> Windows 10</li>', recommended: null });
        expect(normalizeRequirements({ minimum: null, recommended: null })).toBeNull();
        expect(normalizeRequirements(undefined)).toBeNull();
    });

    test('findCachedItem finds an item in lists cached by the home page', () => {
        localStorage.setItem(`gdh-api:v1:${API}/hub/gog`, JSON.stringify({ ts: Date.now(), data: { trending: [{ id: '42', name: 'Nox™' }], newest: [], deals: [] } }));
        expect(findCachedItem('gog', 42)).toEqual({ id: '42', name: 'Nox™' });
        expect(findCachedItem('steam', 42)).toBeNull();
    });
});

const steamApp = {
    id: 550,
    name: 'Left 4 Dead 2',
    description: 'Set in the zombie apocalypse.',
    image: 'https://cdn.example/header.jpg',
    url: 'https://store.steampowered.com/app/550',
    isFree: false,
    price: { final: '$9.99', initial: '$9.99', discount: 0 },
    developers: ['Valve'],
    publishers: ['Valve'],
    genres: ['Action'],
    releaseDate: 'Nov 16, 2009',
    metacritic: 89,
    platforms: { windows: true, mac: true, linux: true },
    achievements: 101,
    categories: ['Single-player', 'Online Co-op'],
    requirements: { minimum: '<ul><li><strong>OS *:</strong> Windows 7</li><li><strong>Memory:</strong> 2 GB RAM</li></ul>', recommended: null },
    screenshots: [{ thumb: 'https://cdn.example/s1.jpg', full: 'https://cdn.example/s1_full.jpg' }],
    players: 12345,
    reviews: { label: 'Overwhelmingly Positive', total: 800000, percent: 97 },
    news: [{ id: 'n1', title: 'Patch notes', url: 'https://steam.example/news', date: 1757000000000 }],
    website: 'https://www.l4d.com/',
};

const gogGame = {
    id: '1207658964',
    name: 'Nox™',
    description: 'An excellent action/RPG hybrid.',
    image: 'https://images.gog.example/bg.jpg',
    url: 'https://www.gog.com/en/game/nox',
    releaseDate: '2000-01-31T00:00:00+01:00',
    developers: ['Westwood Studios'],
    publishers: ['Electronic Arts'],
    genres: ['Role-playing', 'Action'],
    tags: ['Classic', 'Isometric'],
    features: ['Single-player'],
    ageRating: 'Teen',
    platforms: ['Windows'],
    screenshots: [],
    requirements: { minimum: 'OS: Windows 10/11<br>Processor: 1.8 GHz', recommended: null },
};

/** Routes fetch calls by URL; unknown URLs fail like an unreachable service. */
function routeFetch(routes) {
    return mockFetch((url, options = {}) => {
        const method = options.method || 'GET';
        for (const [match, respond] of routes) {
            if (url.includes(match)) return Promise.resolve(respond(url, options, method));
        }
        return Promise.reject(new Error(`offline: ${url}`));
    });
}

function renderPage(path, { user = null, state } = {}) {
    return render(
        <UserContext.Provider value={{ user }}>
            <MemoryRouter initialEntries={[{ pathname: path, state }]}>
                <Routes>
                    <Route path="/game/:source/:id" element={<StoreGamePage />} />
                    <Route path="*" element={<LocationProbe />} />
                </Routes>
            </MemoryRouter>
        </UserContext.Provider>
    );
}

describe('StoreGamePage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Steam game: shows details, requirements, stats, news and community reviews', async () => {
        const fetch = routeFetch([
            ['/hub/steam/app/550', () => jsonResponse(steamApp)],
            ['api.rawg.io/api/games?', () => jsonResponse({ results: [] })],
            ['/get-all-reviews', () => jsonResponse([
                { id: 1, gameId: 'steam-550', email: 'zoey@example.com', rating: 5, review: 'Classic co-op.' },
                { id: 2, gameId: 12020, email: 'other@example.com', rating: 1, review: 'Different game' },
            ])],
        ]);

        renderPage('/game/steam/550');

        expect(await screen.findByRole('heading', { level: 1, name: 'Left 4 Dead 2' })).toBeInTheDocument();
        expect(screen.getByText('Set in the zombie apocalypse.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'System Requirements' })).toBeInTheDocument();
        expect(screen.getByText('Windows 7')).toBeInTheDocument(); // "OS *:" was normalized and parsed
        expect(screen.getByText('12.3K')).toBeInTheDocument();
        expect(screen.getByText('Patch notes')).toBeInTheDocument();
        expect(screen.getByText('Windows, macOS, Linux')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /View on Steam/ })).toHaveAttribute('href', 'https://store.steampowered.com/app/550');

        expect(await screen.findByText('Classic co-op.')).toBeInTheDocument();
        expect(screen.queryByText('Different game')).not.toBeInTheDocument();
        expect(fetch.mock.calls.some(([url]) => url === `${API}/hub/steam/app/550`)).toBe(true);
    });

    // apiCache keeps responses in memory for the whole file, so this test uses its own game
    test('renders the clicked card immediately and falls back to RAWG when the backend is down', async () => {
        routeFetch([
            ['api.rawg.io/api/games?', () => jsonResponse({ results: [{ id: 4200, name: 'Portal 2' }] })],
            ['api.rawg.io/api/games/4200', () => jsonResponse({
                id: 4200,
                name: 'Portal 2',
                description_raw: 'RAWG description',
                background_image: 'https://media.rawg.io/media/games/l4d2.jpg',
                esrb_rating: { name: 'Mature' },
                playtime: 9,
                platforms: [{ platform: { slug: 'pc', name: 'PC' }, requirements: { minimum: 'Minimum: OS: Windows XP Memory: 2 GB RAM' } }],
                tags: [{ id: 1, name: 'Co-op' }],
                stores: [{ store: { name: 'Steam' } }],
            })],
            ['/get-all-reviews', () => jsonResponse([])],
        ]);

        renderPage('/game/steam/620', { state: { item: { id: 620, name: 'Portal 2', price: '$9.99', source: 'steam', image: 'https://cdn.example/h.jpg' } } });

        // Header comes from router state, before any request finished
        expect(screen.getByRole('heading', { level: 1, name: 'Portal 2' })).toBeInTheDocument();

        expect(await screen.findByText('RAWG description')).toBeInTheDocument();
        expect(screen.getByText('Windows XP')).toBeInTheDocument();
        expect(screen.getByText('Mature')).toBeInTheDocument();
        expect(screen.getByText('9h avg playtime')).toBeInTheDocument();
    });

    test('GOG game: uses the GOG details endpoint', async () => {
        const fetch = routeFetch([
            ['/hub/gog/game/1207658964', () => jsonResponse(gogGame)],
            // Steam's search returns a different game with a similar title: it must be ignored
            ['/hub/steam/lookup', () => jsonResponse({ found: true, name: 'Nox Archaist', releaseDate: 'Jan 28, 2021', website: 'https://noxarchaist.com', players: 0 })],
            ['api.rawg.io/api/games?', () => jsonResponse({ results: [] })],
            ['/get-all-reviews', () => jsonResponse([])],
        ]);

        renderPage('/game/gog/1207658964');

        expect(await screen.findByRole('heading', { level: 1, name: 'Nox™' })).toBeInTheDocument();
        expect(screen.getByText('An excellent action/RPG hybrid.')).toBeInTheDocument();
        expect(screen.getByText('Westwood Studios')).toBeInTheDocument();
        expect(screen.getByText('Teen')).toBeInTheDocument();
        expect(screen.getByText('1.8 GHz')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /View on GOG/ })).toHaveAttribute('href', 'https://www.gog.com/en/game/nox');
        await waitFor(() => expect(fetch.mock.calls.some(([url]) => url.includes('/hub/steam/lookup?name=Nox%E2%84%A2'))).toBe(true));
        await act(async () => {});
        expect(screen.queryByText('noxarchaist.com')).not.toBeInTheDocument();
        expect(screen.queryByText('Playing now')).not.toBeInTheDocument();
    });

    test('invalid URLs show "Game not found" without requests', () => {
        const fetch = routeFetch([]);
        renderPage('/game/epic/abc');
        expect(screen.getByText('Game not found')).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    test('shows an error when nothing identifies the game', async () => {
        routeFetch([]);
        renderPage('/game/steam/999999');
        expect(await screen.findByText('Game details are not available right now.')).toBeInTheDocument();
    });

    test('logged-in user can favorite and review with the store key', async () => {
        const fetch = routeFetch([
            ['/hub/steam/app/550', () => jsonResponse(steamApp)],
            ['api.rawg.io', () => jsonResponse({ results: [] })],
            ['/get-all-reviews', () => jsonResponse([])],
            ['/getFav', () => jsonResponse([])],
            ['/addfav', () => jsonResponse({ ok: true })],
            ['/delfav/', () => jsonResponse('OK')],
            ['/submit-review', () => jsonResponse({ id: 9 })],
        ]);
        const user = { uid: 'u1', email: 'bill@example.com' };

        renderPage('/game/steam/550', { user });
        await screen.findByRole('heading', { level: 1, name: 'Left 4 Dead 2' });

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Add to favorites/ })); });
        const addCall = fetch.mock.calls.find(([url]) => url.endsWith('/addfav'));
        expect(JSON.parse(addCall[1].body)).toEqual({ name: 'Left 4 Dead 2', gameId: 'steam-550', userId: 'u1' });
        expect(screen.getByRole('button', { name: /In your favorites/ })).toBeInTheDocument();

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: /In your favorites/ })); });
        expect(fetch.mock.calls.some(([url, opts]) => url.endsWith('/delfav/steam-550') && opts.method === 'DELETE')).toBe(true);

        fireEvent.change(screen.getByLabelText('Write a review'), { target: { value: 'Still great after all these years' } });
        fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Post review' })); });

        const reviewCall = fetch.mock.calls.find(([url]) => url.endsWith('/submit-review'));
        expect(JSON.parse(reviewCall[1].body)).toMatchObject({ gameId: 'steam-550', gameName: 'Left 4 Dead 2', rating: 5, reviewText: 'Still great after all these years' });
    });

    test('guests get a login prompt when adding a favorite', async () => {
        routeFetch([
            ['/hub/steam/app/550', () => jsonResponse(steamApp)],
            ['api.rawg.io', () => jsonResponse({ results: [] })],
            ['/get-all-reviews', () => jsonResponse([])],
        ]);
        renderPage('/game/steam/550');
        await screen.findByRole('heading', { level: 1, name: 'Left 4 Dead 2' });

        fireEvent.click(screen.getByRole('button', { name: /Add to favorites/ }));
        expect(screen.getByText('You must log in to add favorites.')).toBeInTheDocument();
    });

    test('clicking a screenshot opens it full size', async () => {
        routeFetch([
            ['/hub/steam/app/550', () => jsonResponse(steamApp)],
            ['api.rawg.io', () => jsonResponse({ results: [] })],
            ['/get-all-reviews', () => jsonResponse([])],
        ]);
        renderPage('/game/steam/550');

        fireEvent.click(await screen.findByRole('button', { name: 'Open screenshot 1' }));
        expect(screen.getByAltText('Screenshot')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('dialog', { name: 'Screenshot' }));
        expect(screen.queryByAltText('Screenshot')).not.toBeInTheDocument();
    });
});

function ItemButton({ item }) {
    const [onItemClick, modal] = useStoreItem();
    return <><button onClick={() => onItemClick(item)}>open</button>{modal}</>;
}

describe('useStoreItem', () => {
    afterEach(() => vi.restoreAllMocks());

    const renderButton = item => render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<ItemButton item={item} />} />
                <Route path="*" element={<LocationProbe />} />
            </Routes>
        </MemoryRouter>
    );

    test('Steam and GOG items open the in-site game page', () => {
        renderButton({ id: 730, name: 'Counter-Strike 2', source: 'steam' });
        fireEvent.click(screen.getByText('open'));
        expect(screen.getByTestId('location')).toHaveTextContent('/game/steam/730');
    });

    test('GOG items pass the item in router state', () => {
        renderButton({ id: '42', name: 'Nox', source: 'gog' });
        fireEvent.click(screen.getByText('open'));
        expect(screen.getByTestId('location')).toHaveTextContent('/game/gog/42|{"item":{"id":"42","name":"Nox","source":"gog"}}');
    });

    test('other sources still open their website', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        renderButton({ id: 'x', name: 'Run', source: 'speedrun', url: 'https://speedrun.com/run' });
        fireEvent.click(screen.getByText('open'));
        expect(open).toHaveBeenCalledWith('https://speedrun.com/run', '_blank', 'noopener,noreferrer');
    });
});

describe('AllReview redirect for store game ids', () => {
    test('/allreview/steam-730 goes to the store game page', () => {
        render(
            <UserContext.Provider value={{ user: null }}>
                <MemoryRouter initialEntries={['/allreview/steam-730']}>
                    <Routes>
                        <Route path="/allreview/:gameId" element={<AllReview />} />
                        <Route path="*" element={<LocationProbe />} />
                    </Routes>
                </MemoryRouter>
            </UserContext.Provider>
        );
        expect(screen.getByTestId('location')).toHaveTextContent('/game/steam/730');
    });
});
