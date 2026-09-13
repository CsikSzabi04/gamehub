import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DbdCards from '../src/FeaturesByGame/DBD/DbdCards.jsx';
import { jsonResponse, mockFetch } from './helpers.jsx';

const killer = {
    id: 'k1', name: 'The Trapper', role: 'Killer', gender: 'male', height: 'Tall', difficulty: 'easy',
    overview: 'Sets bear traps.', lore: 'Evan MacMillan grew up in a mining family.', perks: ['Unnerving Presence', 'Brutal Strength'],
    image: 'https://img.example/trapper.png',
};

const survivor = {
    id: 's1', name: 'Dwight Fairfield', role: 'survivor', gender: 'male', difficulty: 'easy',
    overview: 'A nervous leader.', backstory: 'Dwight worked at an office.', perks: ['Bond'],
    image: 'https://img.example/dwight.png',
};

describe('DbdCards (character modal)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders nothing without a character', () => {
        const { container } = render(<DbdCards selectedCharacter={null} closeModal={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('does not crash when the role is missing', () => {
        render(<DbdCards selectedCharacter={{ ...survivor, role: undefined }} closeModal={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'Dwight Fairfield' })).toBeInTheDocument();
    });

    test('shows the biography tab by default', () => {
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'The Trapper' })).toBeInTheDocument();
        expect(screen.getByText('KILLER')).toBeInTheDocument();
        expect(screen.getByText('Sets bear traps.')).toBeInTheDocument();
        expect(screen.getByText('Tall')).toBeInTheDocument();
    });

    test('Backstory tab falls back to the lore field (regression)', () => {
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Backstory' }));
        expect(screen.getByText('Evan MacMillan grew up in a mining family.')).toBeInTheDocument();
    });

    test('Backstory tab prefers backstory when present', () => {
        render(<DbdCards selectedCharacter={survivor} closeModal={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Backstory' }));
        expect(screen.getByText('Dwight worked at an office.')).toBeInTheDocument();
    });

    test('clicking a killer perk loads it from the killer endpoint', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse({
            name: 'Brutal Strength', description: 'Break pallets faster.\nAlso generators.', icon: null,
        })));
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Perks' }));
        expect(screen.getByText('Click on a perk to see details!')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('heading', { name: 'Brutal Strength' }));
        expect(screen.getByText('Loading perk details')).toBeInTheDocument();

        expect(await screen.findByText('Break pallets faster.')).toBeInTheDocument();
        expect(screen.getByText('Also generators.')).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith('https://gamehub-backend-zekj.onrender.com/perksK/Brutal%20Strength');
    });

    test('survivor perks use the survivor endpoint', async () => {
        const fetch = mockFetch(() => Promise.resolve(jsonResponse({ name: 'Bond', description: 'See allies.' })));
        render(<DbdCards selectedCharacter={survivor} closeModal={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Perks' }));
        fireEvent.click(screen.getByRole('heading', { name: 'Bond' }));

        await screen.findByText('See allies.');
        expect(fetch).toHaveBeenCalledWith('https://gamehub-backend-zekj.onrender.com/perksS/Bond');
    });

    test('a failed perk request does not leave the loader stuck (regression)', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetch(() => Promise.reject(new Error('offline')));
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Perks' }));
        fireEvent.click(screen.getByRole('heading', { name: 'Unnerving Presence' }));

        await waitFor(() => expect(screen.queryByText('Loading perk details')).not.toBeInTheDocument());
        expect(screen.getByText('Click on a perk to see details!')).toBeInTheDocument();
    });

    test('a perk without description does not crash', async () => {
        mockFetch(() => Promise.resolve(jsonResponse({ name: 'Mystery perk' })));
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Perks' }));
        fireEvent.click(screen.getByRole('heading', { name: 'Brutal Strength' }));

        expect(await screen.findByText('Mystery perk')).toBeInTheDocument();
    });

    test('a broken portrait is hidden instead of looping onError (regression)', () => {
        render(<DbdCards selectedCharacter={killer} closeModal={vi.fn()} />);
        const img = screen.getByAltText('The Trapper');

        fireEvent.error(img);

        expect(img.style.visibility).toBe('hidden');
        expect(img).toHaveAttribute('src', 'https://img.example/trapper.png');
        expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
    });

    test('the close button calls closeModal', () => {
        const closeModal = vi.fn();
        render(<DbdCards selectedCharacter={killer} closeModal={closeModal} />);
        // The close button is the first button (before the tabs)
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(closeModal).toHaveBeenCalledTimes(1);
    });
});
