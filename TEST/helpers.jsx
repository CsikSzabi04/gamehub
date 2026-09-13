// Shared helpers for the TEST suite (this file has no tests itself).
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * Controllable IntersectionObserver mock (jsdom has none).
 * Call `triggerIntersection()` to make every observed element "visible".
 */
export function installIntersectionObserver() {
    const instances = [];

    class MockIntersectionObserver {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.elements = new Set();
            this.disconnected = false;
            instances.push(this);
        }
        observe(el) { this.elements.add(el); }
        unobserve(el) { this.elements.delete(el); }
        disconnect() { this.disconnected = true; this.elements.clear(); }
        takeRecords() { return []; }
    }

    globalThis.IntersectionObserver = MockIntersectionObserver;

    return {
        instances,
        triggerIntersection(isIntersecting = true) {
            instances
                .filter(o => !o.disconnected)
                .forEach(o => {
                    const entries = [...o.elements].map(target => ({ target, isIntersecting }));
                    if (entries.length) o.callback(entries, o);
                });
        },
    };
}

/** Builds a fetch Response-like object. */
export function jsonResponse(data, { ok = true, status = 200 } = {}) {
    return { ok, status, json: () => Promise.resolve(data) };
}

/** Replaces global fetch with a vi.fn and returns it. */
export function mockFetch(impl) {
    const fn = vi.fn(impl);
    globalThis.fetch = fn;
    return fn;
}

/** Shows the current route, so tests can assert where a component navigated. */
export function LocationProbe() {
    const location = useLocation();
    return (
        <div data-testid="location">
            {location.pathname}
            {location.state ? `|${JSON.stringify(location.state)}` : ''}
        </div>
    );
}

/**
 * Renders `ui` at `route` inside a MemoryRouter. Every other path renders the LocationProbe,
 * so navigation away from the component under test is visible in the DOM.
 */
export function renderWithRouter(ui, { route = '/test', path = '/test' } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path={path} element={<>{ui}<LocationProbe /></>} />
                <Route path="*" element={<LocationProbe />} />
            </Routes>
        </MemoryRouter>
    );
}

export function makeGame(id, overrides = {}) {
    return {
        id,
        name: `Game ${id}`,
        slug: `game-${id}`,
        background_image: `https://img.example/${id}.jpg`,
        released: '2020-05-17',
        rating: 4.26,
        genres: [{ name: 'Action' }],
        platforms: [{ platform: { id: 1, name: 'PC' } }],
        cheapest: 20,
        ...overrides,
    };
}
