import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { jsonResponse, mockFetch } from './helpers.jsx';

// apiCache keeps module-level state (memory cache, in-flight requests),
// so every test imports a fresh copy of the module.
async function loadApiCache() {
    vi.resetModules();
    return import('../src/Components/apiCache.js');
}

const OTHER_URL = 'https://example.com/data';

describe('apiCache', () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.__gdhPrefetch;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('fetches once and serves later calls from the cache', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse({ value: 1 })));
        const { cachedFetch } = await loadApiCache();

        await expect(cachedFetch(OTHER_URL)).resolves.toEqual({ value: 1 });
        await expect(cachedFetch(OTHER_URL)).resolves.toEqual({ value: 1 });

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('deduplicates concurrent requests for the same URL', async () => {
        let resolve;
        const fetch = mockFetch(() => new Promise(r => { resolve = r; }));
        const { cachedFetch } = await loadApiCache();

        const a = cachedFetch(OTHER_URL);
        const b = cachedFetch(OTHER_URL);
        resolve(jsonResponse(['x']));

        await expect(Promise.all([a, b])).resolves.toEqual([['x'], ['x']]);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('rejects on HTTP errors and does not cache the failure', async () => {
        const fetch = mockFetch()
            .mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }))
            .mockResolvedValueOnce(jsonResponse({ ok: 'second time' }));
        const { cachedFetch } = await loadApiCache();

        await expect(cachedFetch(OTHER_URL)).rejects.toThrow('HTTP 500');
        await expect(cachedFetch(OTHER_URL)).resolves.toEqual({ ok: 'second time' });
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('persists responses to localStorage and reads them back after a reload', async () => {
        mockFetch(() => Promise.resolve(jsonResponse({ persisted: true })));
        let api = await loadApiCache();
        await api.cachedFetch(OTHER_URL);

        const keys = Object.keys(localStorage).filter(k => k.startsWith('gdh-api:'));
        expect(keys).toHaveLength(1);

        // "Reload": fresh module, network now fails, data must come from storage
        const fetch = mockFetch(() => Promise.reject(new Error('offline')));
        api = await loadApiCache();
        expect(api.peekCached(OTHER_URL)).toEqual({ persisted: true });
        await expect(api.cachedFetch(OTHER_URL)).resolves.toEqual({ persisted: true });
        expect(fetch).not.toHaveBeenCalled();
    });

    test('peekCached returns undefined for unknown URLs', async () => {
        const { peekCached } = await loadApiCache();
        expect(peekCached('https://example.com/never')).toBeUndefined();
    });

    test('stale data is returned immediately and refreshed in the background', async () => {
        localStorage.setItem(`gdh-api:v1:${OTHER_URL}`, JSON.stringify({ data: 'old', ts: 0 }));
        const fetch = mockFetch(() => Promise.resolve(jsonResponse('new')));
        const { cachedFetch, subscribe, peekCached } = await loadApiCache();

        const listener = vi.fn();
        const unsubscribe = subscribe(OTHER_URL, listener);

        await expect(cachedFetch(OTHER_URL)).resolves.toBe('old');
        expect(fetch).toHaveBeenCalledTimes(1);

        await waitFor(() => expect(listener).toHaveBeenCalledWith('new'));
        expect(peekCached(OTHER_URL)).toBe('new');

        unsubscribe();
    });

    test('unsubscribed listeners are not called', async () => {
        localStorage.setItem(`gdh-api:v1:${OTHER_URL}`, JSON.stringify({ data: 'old', ts: 0 }));
        mockFetch(() => Promise.resolve(jsonResponse('new')));
        const { cachedFetch, subscribe, peekCached } = await loadApiCache();

        const listener = vi.fn();
        subscribe(OTHER_URL, listener)();
        await cachedFetch(OTHER_URL);
        await waitFor(() => expect(peekCached(OTHER_URL)).toBe('new'));

        expect(listener).not.toHaveBeenCalled();
    });

    test('backend endpoints with a snapshot answer from the snapshot when the API is slow', async () => {
        const { cachedFetch, API_BASE } = await loadApiCache();
        const fetch = mockFetch((url) => {
            if (url === '/api-snapshot/stores.json') return Promise.resolve(jsonResponse([{ storeName: 'Steam' }]));
            return new Promise(() => {}); // live API never answers (sleeping Render instance)
        });

        await expect(cachedFetch(`${API_BASE}/stores`)).resolves.toEqual([{ storeName: 'Steam' }]);
        expect(fetch.mock.calls.map(c => c[0])).toEqual(
            expect.arrayContaining([`${API_BASE}/stores`, '/api-snapshot/stores.json'])
        );
    });

    test('URLs without a snapshot only hit the network', async () => {
        const { cachedFetch, API_BASE } = await loadApiCache();
        const fetch = mockFetch(() => Promise.resolve(jsonResponse([])));

        await cachedFetch(`${API_BASE}/get-all-reviews`);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(`${API_BASE}/get-all-reviews`);
    });

    test('useApi returns loading, then transformed data', async () => {
        mockFetch(() => Promise.resolve(jsonResponse({ games: [1, 2, 3] })));
        const { useApi } = await loadApiCache();
        const toCount = data => data.games.length;

        const { result } = renderHook(() => useApi(OTHER_URL, toCount));
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.data).toBe(3));
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    test('useApi exposes errors', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetch(() => Promise.reject(new Error('boom')));
        const { useApi } = await loadApiCache();

        const { result } = renderHook(() => useApi(OTHER_URL));

        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
        expect(result.current.loading).toBe(false);
    });

    test('useApi skips fetching when the URL is null', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse({})));
        const { useApi } = await loadApiCache();

        const { result } = renderHook(() => useApi(null));
        await act(async () => {});

        expect(fetch).not.toHaveBeenCalled();
        expect(result.current.data).toBeUndefined();
    });
});
