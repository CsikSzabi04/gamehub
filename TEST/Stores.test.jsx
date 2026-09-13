import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const { cachedFetch } = vi.hoisted(() => ({ cachedFetch: vi.fn() }));
vi.mock('../src/Components/apiCache.js', () => ({ cachedFetch }));

import Stores from '../src/Stores/Stores.jsx';

const stores = [
    { storeID: '1', storeName: 'Steam', images: { logo: '/img/stores/logos/0.png' } },
    { storeID: '7', storeName: 'GOG', images: { logo: '/img/stores/logos/6.png' } },
];

describe('Stores modal', () => {
    beforeEach(() => {
        cachedFetch.mockReset();
    });

    test('renders nothing when hidden', () => {
        cachedFetch.mockResolvedValue(stores);
        const { container } = render(<Stores modalStoreVisible={false} closeStore={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('loads the store list from the cached API', async () => {
        cachedFetch.mockResolvedValue(stores);
        render(<Stores modalStoreVisible closeStore={vi.fn()} />);

        expect(await screen.findByText('Steam')).toBeInTheDocument();
        expect(screen.getByText('GOG')).toBeInTheDocument();
        expect(cachedFetch).toHaveBeenCalledWith('https://gamehub-backend-zekj.onrender.com/stores');
        expect(screen.getByAltText('Steam')).toHaveAttribute('src', 'https://www.cheapshark.com/img/stores/logos/0.png');
    });

    test('an unexpected API answer shows an empty list instead of crashing', async () => {
        cachedFetch.mockResolvedValue({ error: 'rate limited' });
        render(<Stores modalStoreVisible closeStore={vi.fn()} />);
        await waitFor(() => expect(cachedFetch).toHaveBeenCalled());
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    test('a failed request is logged, not thrown', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        cachedFetch.mockRejectedValue(new Error('offline'));
        render(<Stores modalStoreVisible closeStore={vi.fn()} />);
        await waitFor(() => expect(log).toHaveBeenCalled());
        log.mockRestore();
    });

    test('the × button and the backdrop close the modal, the content does not', async () => {
        cachedFetch.mockResolvedValue(stores);
        const closeStore = vi.fn();
        const { container } = render(<Stores modalStoreVisible closeStore={closeStore} />);
        await screen.findByText('Steam');

        fireEvent.click(screen.getByText('Steam'));
        expect(closeStore).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText('×'));
        expect(closeStore).toHaveBeenCalledTimes(1);

        fireEvent.click(container.firstChild);
        expect(closeStore).toHaveBeenCalledTimes(2);
    });
});
