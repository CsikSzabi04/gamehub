import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
// Exit animations never finish under fake timers, so AnimatePresence swaps its children instantly here
vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal();
    const { Fragment, createElement } = await import('react');
    return { ...actual, AnimatePresence: ({ children }) => createElement(Fragment, null, children) };
});

import StartUp from '../src/Features/StartUp.jsx';

// Progress grows at least 5% per 400ms tick, so 21 ticks always reach 100%
const FULL_LOAD_MS = 400 * 21;

describe('StartUp (intro screen)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('shows the loading state and 0% at start', () => {
        render(<StartUp onLoaded={() => {}} />);
        expect(screen.getByText('Loading')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('Loading amazing games...')).toBeInTheDocument();
    });

    test('progress increases but never goes over 100%', () => {
        vi.spyOn(Math, 'random').mockReturnValue(1); // +20% per tick
        render(<StartUp onLoaded={() => {}} />);

        act(() => { vi.advanceTimersByTime(400); });
        expect(screen.getByText('20%')).toBeInTheDocument();

        act(() => { vi.advanceTimersByTime(400 * 3); });
        expect(screen.getByText('80%')).toBeInTheDocument();
    });

    test('rotates the slogans', () => {
        render(<StartUp onLoaded={() => {}} />);
        act(() => { vi.advanceTimersByTime(800); });
        expect(screen.getByText('Preparing your gaming experience...')).toBeInTheDocument();
    });

    test('shows the welcome screen after loading completes', () => {
        render(<StartUp onLoaded={() => {}} />);

        act(() => { vi.advanceTimersByTime(FULL_LOAD_MS); });
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();

        act(() => { vi.advanceTimersByTime(300); });
        expect(screen.getByText('Start Exploring')).toBeInTheDocument();
    });

    test('"Start Exploring" calls onLoaded exactly once after the exit animation', () => {
        const onLoaded = vi.fn();
        render(<StartUp onLoaded={onLoaded} />);
        act(() => { vi.advanceTimersByTime(FULL_LOAD_MS); });
        act(() => { vi.advanceTimersByTime(300); }); // the welcome timer starts only after loading finished

        fireEvent.click(screen.getByText('Start Exploring'));
        expect(onLoaded).not.toHaveBeenCalled();

        act(() => { vi.advanceTimersByTime(500); });
        expect(onLoaded).toHaveBeenCalledTimes(1);
    });

    test('unmounting during loading does not throw or leave timers running', () => {
        const { unmount } = render(<StartUp onLoaded={() => {}} />);
        act(() => { vi.advanceTimersByTime(1200); });
        unmount();
        expect(() => act(() => { vi.advanceTimersByTime(FULL_LOAD_MS); })).not.toThrow();
        expect(vi.getTimerCount()).toBe(0);
    });
});
