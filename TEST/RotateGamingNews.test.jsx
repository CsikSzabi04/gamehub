import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RotateGamingNews from '../src/Rotate/RotateGamingNews.jsx';

const articles = [
    { url: 'https://news.example/1', title: 'First headline', description: 'One', urlToImage: 'https://img.example/1.jpg', author: 'Alice', publishedAt: '2026-09-01T10:00:00Z' },
    { url: 'https://news.example/2', title: 'Second headline', description: 'Two', urlToImage: null, author: null, publishedAt: '2026-09-02T10:00:00Z' },
    { url: 'https://news.example/3', title: 'Third headline', description: 'Three', urlToImage: 'https://img.example/3.jpg', author: 'Carol', publishedAt: '2026-09-03T10:00:00Z' },
];

const track = (container) => container.querySelector('[style*="translateX"]');

describe('RotateGamingNews', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('shows only the title and a loader while there are no articles', () => {
        const { container } = render(<RotateGamingNews articles={[]} name="Latest Gaming News" />);
        expect(screen.getByRole('heading', { name: 'Latest Gaming News' })).toBeInTheDocument();
        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(container.querySelector('.animate-pulse')).not.toBeNull();
    });

    test('handles articles = undefined', () => {
        expect(() => render(<RotateGamingNews name="News" />)).not.toThrow();
    });

    test('renders every article as an external link', () => {
        render(<RotateGamingNews articles={articles} name="News" />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
        expect(links[0]).toHaveAttribute('href', 'https://news.example/1');
        expect(links[0]).toHaveAttribute('target', '_blank');
        expect(links[0]).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });

    test('shows date and author, and skips the author when unknown', () => {
        render(<RotateGamingNews articles={articles} name="News" />);
        expect(screen.getByText('Sep 1, 2026 · Alice')).toBeInTheDocument();
        expect(screen.getByText('Sep 2, 2026')).toBeInTheDocument();
    });

    test('articles without an image render no <img>', () => {
        const { container } = render(<RotateGamingNews articles={[articles[1]]} name="News" />);
        expect(container.querySelector('img')).toBeNull();
    });

    test('next / previous buttons move by one page and wrap', () => {
        const { container } = render(<RotateGamingNews articles={articles} name="News" />);

        fireEvent.click(screen.getByRole('button', { name: 'Next News' }));
        expect(track(container).style.transform).toBe('translateX(-100%)');

        fireEvent.click(screen.getByRole('button', { name: 'Previous News' }));
        fireEvent.click(screen.getByRole('button', { name: 'Previous News' }));
        expect(track(container).style.transform).toBe('translateX(-200%)');
    });

    test('auto-advances every 20 seconds', () => {
        vi.useFakeTimers();
        const { container } = render(<RotateGamingNews articles={articles} name="News" />);

        act(() => { vi.advanceTimersByTime(20000); });
        expect(track(container).style.transform).toBe('translateX(-100%)');

        act(() => { vi.advanceTimersByTime(40000); });
        expect(track(container).style.transform).toBe('translateX(-0%)');
    });
});
