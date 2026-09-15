import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { canLaunchSteam, findOwnedSteamGame, launchableAppId, steamRunUrl } from '../src/library/steamLaunch.js';
import PlayButton from '../src/library/PlayButton.jsx';

const gta = { gameKey: 'steam-271590', source: 'steam', sourceId: '271590', name: 'Grand Theft Auto V Legacy', status: 'backlog' };
const cs2 = { gameKey: 'steam-730', source: 'steam', sourceId: '730', name: 'Counter-Strike 2', status: 'playing' };
const wished = { gameKey: 'steam-1091500', source: 'steam', sourceId: '1091500', name: 'Cyberpunk 2077', status: 'wishlist' };
const xbox = { gameKey: 'xbox-123', source: 'xbox', sourceId: '123', name: 'Halo Infinite', status: 'playing' };

describe('steamLaunch', () => {
    afterEach(() => vi.unstubAllGlobals());

    test('steamRunUrl builds the Steam launch link', () => {
        expect(steamRunUrl(730)).toBe('steam://rungameid/730');
    });

    test('launchableAppId: owned Steam games only', () => {
        expect(launchableAppId(cs2)).toBe(730);
        expect(launchableAppId({ ...cs2, sourceId: '' })).toBe(730); // falls back to the key
        expect(launchableAppId(wished)).toBeNull();
        expect(launchableAppId(xbox)).toBeNull();
        expect(launchableAppId(null)).toBeNull();
    });

    test('findOwnedSteamGame matches the appid first, then the title', () => {
        const items = [gta, cs2, wished, xbox];
        expect(findOwnedSteamGame(items, { steamAppId: 730, name: 'Something else' })).toBe(cs2);
        // RAWG links GTA V to the Enhanced appid; the library has the Legacy edition
        expect(findOwnedSteamGame(items, { steamAppId: 3240220, name: 'Grand Theft Auto V' })).toBe(gta);
        expect(findOwnedSteamGame(items, { name: 'Cyberpunk 2077' })).toBeNull(); // wishlist
        expect(findOwnedSteamGame(items, { name: 'Halo Infinite' })).toBeNull(); // not Steam
        expect(findOwnedSteamGame(items, {})).toBeNull();
    });

    test('canLaunchSteam is false on phones', () => {
        vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', platform: 'iPhone', maxTouchPoints: 5 });
        expect(canLaunchSteam()).toBe(false);
        vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0', platform: 'Win32', maxTouchPoints: 0 });
        expect(canLaunchSteam()).toBe(true);
    });
});

describe('PlayButton launch dialog', () => {
    beforeEach(() => {
        localStorage.clear();
        // jsdom can't navigate to steam:// links
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => vi.restoreAllMocks());

    test('asks in our own dialog, then shows "Starting…"', () => {
        render(<PlayButton item={cs2} />);
        fireEvent.click(screen.getByRole('button', { name: 'Play' }));

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveTextContent('Launch Counter-Strike 2?');
        fireEvent.click(screen.getByLabelText("Don't ask me again"));
        fireEvent.click(screen.getAllByRole('button', { name: 'Play' }).at(-1));

        expect(screen.getByText('Starting Counter-Strike 2…')).toBeInTheDocument();
        expect(localStorage.getItem('gdh-steam-skip-confirm')).toBe('1');
    });

    test('"Don\'t ask again" skips the confirmation next time', () => {
        localStorage.setItem('gdh-steam-skip-confirm', '1');
        render(<PlayButton item={cs2} />);
        fireEvent.click(screen.getByRole('button', { name: 'Play' }));
        expect(screen.queryByText('Launch Counter-Strike 2?')).not.toBeInTheDocument();
        expect(screen.getByText('Starting Counter-Strike 2…')).toBeInTheDocument();
    });

    test('no button for wishlisted games', () => {
        render(<PlayButton item={wished} />);
        expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
    });
});
