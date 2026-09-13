import React from 'react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import LazySection from '../src/Components/LazySection.jsx';
import LazyImage from '../src/Components/LazyImage.jsx';
import { useFetchOnVisible } from '../src/Components/useFetchOnVisible.js';
import { installIntersectionObserver } from './helpers.jsx';

let io;

beforeEach(() => {
    io = installIntersectionObserver();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('LazySection', () => {
    test('shows a placeholder until the section is near the viewport', () => {
        render(<LazySection><p>Heavy content</p></LazySection>);
        expect(screen.queryByText('Heavy content')).not.toBeInTheDocument();

        act(() => io.triggerIntersection());

        expect(screen.getByText('Heavy content')).toBeInTheDocument();
    });

    test('ignores "not intersecting" notifications', () => {
        render(<LazySection><p>Heavy content</p></LazySection>);
        act(() => io.triggerIntersection(false));
        expect(screen.queryByText('Heavy content')).not.toBeInTheDocument();
    });

    test('passes rootMargin to the observer', () => {
        render(<LazySection rootMargin={123}><p>x</p></LazySection>);
        expect(io.instances[0].options.rootMargin).toBe('123px');
    });

    test('disconnects the observer once visible', () => {
        render(<LazySection><p>x</p></LazySection>);
        act(() => io.triggerIntersection());
        expect(io.instances[0].disconnected).toBe(true);
    });

    test('with placeholder={false} waits invisibly (no spinner) until in view', () => {
        const { container } = render(<LazySection placeholder={false}><p>Footer</p></LazySection>);
        expect(container.querySelector('.animate-spin')).toBeNull();
        expect(screen.queryByText('Footer')).not.toBeInTheDocument();

        act(() => io.triggerIntersection());
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    test('renders immediately in browsers without IntersectionObserver', () => {
        delete globalThis.IntersectionObserver;
        render(<LazySection><p>Old browser content</p></LazySection>);
        expect(screen.getByText('Old browser content')).toBeInTheDocument();
    });

    test('supports React.lazy children (shows the spinner while the chunk loads)', async () => {
        let resolveChunk;
        const LazyChild = React.lazy(() => new Promise(r => { resolveChunk = r; }));
        const { container } = render(<LazySection><LazyChild /></LazySection>);

        act(() => io.triggerIntersection());
        expect(container.querySelector('.animate-spin')).not.toBeNull();

        await act(async () => { resolveChunk({ default: () => <p>Chunk loaded</p> }); });
        expect(screen.getByText('Chunk loaded')).toBeInTheDocument();
    });
});

describe('LazyImage', () => {
    test('does not load the image before it is in view', () => {
        render(<LazyImage src="a.jpg" alt="Cover" className="w-full" />);
        expect(screen.queryByAltText('Cover')).not.toBeInTheDocument();
    });

    test('loads the image when in view and fades it in after onLoad', () => {
        render(<LazyImage src="a.jpg" alt="Cover" className="w-full" />);
        act(() => io.triggerIntersection());

        const img = screen.getByAltText('Cover');
        expect(img).toHaveAttribute('src', 'a.jpg');
        expect(img).toHaveClass('opacity-0');

        fireEvent.load(img);
        expect(img).toHaveClass('opacity-100');
    });

    test('shows "No image" when the image fails', () => {
        render(<LazyImage src="broken.jpg" alt="Cover" />);
        act(() => io.triggerIntersection());

        fireEvent.error(screen.getByAltText('Cover'));

        expect(screen.getByText('No image')).toBeInTheDocument();
    });
});

function Probe({ fetchFn }) {
    const { ref, data, loading, error } = useFetchOnVisible(fetchFn);
    return (
        <div ref={ref}>
            <span data-testid="state">{loading ? 'loading' : error ? `error:${error.message}` : `data:${JSON.stringify(data)}`}</span>
        </div>
    );
}

describe('useFetchOnVisible', () => {
    test('does not fetch until visible', () => {
        const fetchFn = vi.fn(() => Promise.resolve([1]));
        render(<Probe fetchFn={fetchFn} />);
        expect(fetchFn).not.toHaveBeenCalled();
        expect(screen.getByTestId('state')).toHaveTextContent('loading');
    });

    test('fetches once when visible and exposes the data', async () => {
        const fetchFn = vi.fn(() => Promise.resolve({ ok: true }));
        render(<Probe fetchFn={fetchFn} />);

        act(() => io.triggerIntersection());
        act(() => io.triggerIntersection());

        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('data:{"ok":true}'));
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    test('exposes errors and stops loading', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchFn = vi.fn(() => Promise.reject(new Error('backend down')));
        render(<Probe fetchFn={fetchFn} />);

        act(() => io.triggerIntersection());

        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error:backend down'));
    });

    test('accepts a synchronous fetch function', async () => {
        render(<Probe fetchFn={() => 'plain value'} />);
        act(() => io.triggerIntersection());
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('data:"plain value"'));
    });
});
