import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useT, translate, normalizeLang, LANGUAGES } from '../src/i18n/index.jsx';

describe('translate', () => {
    test('returns the string for each language', () => {
        expect(translate('en', 'common.cancel')).toBe('Cancel');
        expect(translate('hu', 'common.cancel')).toBe('Mégse');
        expect(translate('de', 'common.cancel')).toBe('Abbrechen');
    });

    test('interpolates variables and picks plural forms', () => {
        expect(translate('en', 'header.removeFavorite', { name: 'Doom' })).toBe('Remove Doom');
        expect(translate('en', 'header.gameCount', { count: 1 })).toBe('1 game');
        expect(translate('en', 'header.gameCount', { count: 4 })).toBe('4 games');
        expect(translate('de', 'header.gameCount', { count: 4 })).toBe('4 Spiele');
    });

    test('falls back to English, then to the key', () => {
        expect(translate('xx', 'common.cancel')).toBe('Cancel');
        expect(translate('hu', 'nope.missing')).toBe('nope.missing');
    });

    test('every namespace has the same keys in all languages', () => {
        const modules = import.meta.glob('../src/i18n/locales/*.js', { eager: true });
        // Plural variants (key_one / key_other) may exist in one language only
        const flatKeys = (obj, prefix = '') => [...new Set(Object.entries(obj || {}).flatMap(([k, v]) =>
            v && typeof v === 'object' && !Array.isArray(v)
                ? flatKeys(v, `${prefix}${k}.`)
                : [`${prefix}${k.replace(/_(one|other)$/, '')}`]))];
        for (const [path, mod] of Object.entries(modules)) {
            const en = flatKeys(mod.default.en).sort();
            for (const { code } of LANGUAGES) {
                expect(flatKeys(mod.default[code]).sort(), `${path} (${code})`).toEqual(en);
            }
        }
    });
});

describe('lazy namespaces', () => {
    test('an unloaded namespace returns an empty string, loads, then translates and notifies consumers', async () => {
        vi.resetModules();
        const fresh = await import('../src/i18n/index.jsx');

        // bundled namespace: available immediately
        expect(fresh.translate('hu', 'common.cancel')).toBe('Mégse');

        function LegalTitle() {
            const { t } = fresh.useT();
            return <h1>{t('auth.signIn') || 'pending'}</h1>;
        }
        render(<LegalTitle />);
        expect(screen.getByRole('heading')).toHaveTextContent('pending');
        expect(await screen.findByText('Sign In')).toBeInTheDocument();
        expect(fresh.translate('de', 'auth.signIn')).not.toBe('');
    });
});

describe('normalizeLang', () => {
    test('accepts supported codes and browser locales', () => {
        expect(normalizeLang('hu-HU')).toBe('hu');
        expect(normalizeLang('DE')).toBe('de');
        expect(normalizeLang('fr')).toBeNull();
        expect(normalizeLang(undefined)).toBeNull();
    });
});

describe('LanguageProvider', () => {
    beforeEach(() => localStorage.clear());

    function Probe() {
        const { t, lang, setLang } = useT();
        return (
            <>
                <p>{lang}:{t('common.cancel')}</p>
                <button onClick={() => setLang('de')}>de</button>
            </>
        );
    }

    test('defaults to English without a provider', () => {
        render(<Probe />);
        expect(screen.getByText('en:Cancel')).toBeInTheDocument();
    });

    test('uses the stored language and persists changes', () => {
        localStorage.setItem('gdh-lang', 'hu');
        render(<LanguageProvider><Probe /></LanguageProvider>);
        expect(screen.getByText('hu:Mégse')).toBeInTheDocument();

        fireEvent.click(screen.getByText('de'));
        expect(screen.getByText('de:Abbrechen')).toBeInTheDocument();
        expect(localStorage.getItem('gdh-lang')).toBe('de');
        expect(document.documentElement.lang).toBe('de');
    });
});
