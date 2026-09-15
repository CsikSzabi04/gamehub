import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { jsonResponse, mockFetch } from './helpers.jsx';

vi.mock('../src/Header.jsx', () => ({ default: () => null }));
vi.mock('../src/Footer.jsx', () => ({ default: () => null }));

const LIBRARY = [
    { gameKey: 'steam-1', name: 'Hades', status: 'completed', steamPlaytimeHours: 300, rating: 5 },
    { gameKey: 'steam-2', name: 'Dead Cells', status: 'playing', steamPlaytimeHours: 60 },
    { gameKey: 'steam-3', name: 'Hollow Knight', status: 'completed', playtimeHours: 40, rating: 4 },
    { gameKey: 'steam-4', name: 'Stardew Valley', status: 'dropped', steamPlaytimeHours: 1 },
    { gameKey: 'steam-13', name: 'Blasphemous', status: 'backlog', steamPlaytimeHours: 0 },
];
const setStatus = vi.fn(() => Promise.resolve());
const hideRecommendation = vi.fn(() => Promise.resolve());
let libraryItems = LIBRARY;

vi.mock('../src/library/useLibrary.js', () => ({
    useLibrary: () => ({ items: libraryItems, loading: false, byKey: {}, setStatus }),
}));
vi.mock('../src/achievements/achievementsApi.js', () => ({
    useAchievementGames: () => ({ games: [], loading: false }),
}));
vi.mock('../src/recommendations/recoApi.js', async importOriginal => ({
    ...(await importOriginal()),
    useRecoFeedback: () => ({ hidden: [], loading: false }),
    hideRecommendation: (...args) => hideRecommendation(...args),
    saveTeaser: () => Promise.resolve(),
}));

import ForYouPage from '../src/pages/ForYouPage.jsx';
import { UserContext } from '../src/Features/UserContext.jsx';

const T = { actionRogue: 42804, rogueLite: 3959, hackSlash: 1646, soulsLike: 29482, difficult: 4026, pixel: 3964, farming: 87918, cozy: 97376 };
const app = (appid, name, tags, extra = {}) => ({
    appid, name, image: `https://img/${appid}.jpg`, type: 0, tags, tagWeights: tags.map((_, i) => 1000 - i * 60),
    reviewPct: 92, reviewCount: 20000, isFree: false, comingSoon: false, earlyAccess: false, price: null, ...extra,
});
const OWN_APPS = [
    app(1, 'Hades', [T.actionRogue, T.rogueLite, T.hackSlash, T.difficult]),
    app(2, 'Dead Cells', [T.actionRogue, T.rogueLite, T.pixel, T.difficult]),
    app(3, 'Hollow Knight', [T.soulsLike, T.difficult, T.pixel]),
    app(4, 'Stardew Valley', [T.farming, T.cozy, T.pixel]),
    app(13, 'Blasphemous', [T.soulsLike, T.difficult, T.pixel, T.hackSlash]),
];
const CANDIDATES = [
    app(10, 'Skul', [T.actionRogue, T.rogueLite, T.pixel, T.hackSlash, T.difficult], { price: { final: 8.39, initial: 16.79, discount: 50, formatted: '8,39€', formattedOriginal: '16,79€' } }),
    app(11, 'Cozy Farm', [T.farming, T.cozy, T.pixel]),
    app(12, 'Nine Sols', [T.soulsLike, T.difficult, T.hackSlash]),
];
const TAG_NAMES = { [T.actionRogue]: 'Action Roguelike', [T.rogueLite]: 'Rogue-lite', [T.soulsLike]: 'Souls-like', [T.difficult]: 'Difficult', [T.pixel]: 'Pixel Graphics', [T.hackSlash]: 'Hack and Slash' };

function renderPage(user = { uid: 'u1' }) {
    return render(
        <UserContext.Provider value={{ user, profile: { username: 'x' }, setProfile: vi.fn(), authReady: true }}>
            <MemoryRouter><ForYouPage /></MemoryRouter>
        </UserContext.Provider>,
    );
}

describe('ForYouPage', () => {
    beforeEach(() => {
        libraryItems = LIBRARY;
        setStatus.mockClear();
        hideRecommendation.mockClear();
    });

    test('shows taste, backlog pick, deals and picks with reasons', async () => {
        const fetch = mockFetch(async url => {
            const u = String(url);
            if (u.includes('/reco/apps')) return { ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ apps: OWN_APPS, names: {} })) };
            if (u.includes('/reco/candidates')) return { ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ apps: CANDIDATES })) };
            if (u.includes('/reco/tags')) return { ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ tags: TAG_NAMES })) };            return jsonResponse({});
        });
        renderPage();

        expect(await screen.findByText('Your taste')).toBeInTheDocument();
        expect(screen.getByText('You like a challenge')).toBeInTheDocument();
        // backlog: the owned souls-like
        expect(screen.getByText('Start this from your backlog')).toBeInTheDocument();
        expect(screen.getAllByText('Blasphemous').length).toBeGreaterThan(0);

        // picks arrive with the candidates; the reason names the game that made the difference
        expect((await screen.findAllByText('Skul')).length).toBeGreaterThan(0);
        expect(screen.getAllByText('Because you gave Hades 5 stars').length).toBeGreaterThan(0);
        expect(screen.queryByText('Cozy Farm')).not.toBeInTheDocument();
        expect(screen.queryAllByText('-50%').length).toBeGreaterThan(0);

        const appsCall = fetch.mock.calls.find(([url]) => String(url).includes('/reco/apps'));
        expect(JSON.parse(appsCall[1].body).appids).toEqual(expect.arrayContaining([1, 2, 3, 4, 13]));
        const candidatesCall = fetch.mock.calls.find(([url]) => String(url).includes('/reco/candidates'));
        expect(String(candidatesCall[0])).toContain(String(T.actionRogue));

        // actions
        fireEvent.click(screen.getAllByRole('button', { name: 'Not interested' })[0]);
        await waitFor(() => expect(hideRecommendation).toHaveBeenCalled());
        fireEvent.click(screen.getAllByTitle('Wishlist')[0]);
        await waitFor(() => expect(setStatus).toHaveBeenCalledWith(expect.objectContaining({ gameKey: expect.stringMatching(/^steam-\d+$/) }), 'wishlist'));
    });

    test('an empty library asks the user to import or rate games', async () => {
        libraryItems = [];
        mockFetch(async () => ({ ok: true, status: 200, text: () => Promise.resolve('{"apps":[],"names":{},"tags":{}}') }));
        renderPage();
        expect(await screen.findByText('We do not know you well enough yet')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Open library/ })).toHaveAttribute('href', '/library');
    });
});
