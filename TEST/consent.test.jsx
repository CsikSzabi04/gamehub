import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// consent.js caches the saved choice in module state, so every test gets fresh modules
async function load() {
    vi.resetModules();
    const consent = await import('../src/consent/consent.js');
    const { default: CookieConsent } = await import('../src/consent/CookieConsent.jsx');
    return { consent, CookieConsent };
}

describe('consent storage', () => {
    beforeEach(() => localStorage.clear());

    test('nothing is decided on a first visit; only necessary storage is allowed', async () => {
        const { consent } = await load();
        expect(consent.getConsent()).toBeNull();
        expect(consent.hasConsent('necessary')).toBe(true);
        expect(consent.hasConsent('preferences')).toBe(false);
        expect(consent.hasConsent('analytics')).toBe(false);
    });

    test('reject all saves every optional category as off and removes preference keys', async () => {
        localStorage.setItem('gdh-lfg-contact', 'neo#1234');
        const { consent } = await load();
        consent.rejectAll();

        const saved = JSON.parse(localStorage.getItem('gdh-consent'));
        expect(saved).toMatchObject({ version: consent.CONSENT_VERSION, necessary: true, preferences: false, analytics: false, marketing: false });
        expect(localStorage.getItem('gdh-lfg-contact')).toBeNull();
    });

    test('preferenceStorage only persists with consent', async () => {
        const { consent } = await load();
        consent.preferenceStorage.set('gdh-price-cc', 'de');
        expect(consent.preferenceStorage.get('gdh-price-cc')).toBe('de');   // kept for this session
        expect(localStorage.getItem('gdh-price-cc')).toBeNull();            // but not stored

        consent.saveConsent({ preferences: true });
        consent.preferenceStorage.set('gdh-price-cc', 'hu');
        expect(localStorage.getItem('gdh-price-cc')).toBe('hu');
    });

    test('a choice older than 12 months or from an older version is asked again', async () => {
        localStorage.setItem('gdh-consent', JSON.stringify({ version: 1, necessary: true, preferences: true, updatedAt: '2020-01-01T00:00:00Z' }));
        let { consent } = await load();
        expect(consent.getConsent()).toBeNull();

        localStorage.setItem('gdh-consent', JSON.stringify({ version: 0, necessary: true, updatedAt: new Date().toISOString() }));
        ({ consent } = await load());
        expect(consent.getConsent()).toBeNull();
    });
});

describe('CookieConsent banner', () => {
    beforeEach(() => localStorage.clear());

    test('shows on the first visit with equally easy accept and reject', async () => {
        const { CookieConsent } = await load();
        render(<CookieConsent />);

        expect(await screen.findByRole('dialog', { name: 'Cookie preferences' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reject all' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', '/cookies');
    });

    test('reject all closes the banner and it stays closed on the next visit', async () => {
        let { CookieConsent, consent } = await load();
        const { unmount } = render(<CookieConsent />);
        fireEvent.click(await screen.findByRole('button', { name: 'Reject all' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(consent.hasConsent('preferences')).toBe(false);
        unmount();

        ({ CookieConsent } = await load());
        render(<CookieConsent />);
        await act(async () => {});
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('customize: nothing optional is pre-selected, necessary cannot be turned off, choices are saved', async () => {
        const { CookieConsent, consent } = await load();
        render(<CookieConsent />);
        fireEvent.click(await screen.findByRole('button', { name: 'Customize' }));

        const switches = screen.getAllByRole('switch');
        expect(switches).toHaveLength(4);
        expect(switches[0]).toBeDisabled();
        expect(switches[0]).toHaveAttribute('aria-checked', 'true');
        switches.slice(1).forEach(s => expect(s).toHaveAttribute('aria-checked', 'false'));

        fireEvent.click(screen.getByRole('switch', { name: /Preferences/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Save choices' }));

        expect(consent.getConsent()).toMatchObject({ preferences: true, analytics: false, marketing: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('openCookieSettings() re-opens the settings after a choice was made', async () => {
        const { CookieConsent, consent } = await load();
        consent.acceptAll();
        render(<CookieConsent />);
        await act(async () => {});
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        act(() => consent.openCookieSettings());
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /Preferences/ })).toHaveAttribute('aria-checked', 'true');
    });
});
