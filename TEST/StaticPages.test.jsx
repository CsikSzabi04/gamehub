import { describe, test, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Footer from '../src/Footer.jsx';
import Notfound from '../src/pages/Notfound.jsx';
import { renderWithRouter } from './helpers.jsx';

describe('Footer', () => {
    test('internal links use the router (no full page reload)', () => {
        renderWithRouter(<Footer />);

        const expected = {
            'Discover': '/discover',
            'Contact': '/contact',
            'Terms of Service': '/terms',
            'Privacy Policy': '/privacy',
        };
        for (const [name, href] of Object.entries(expected)) {
            expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
        }

        fireEvent.click(screen.getByRole('link', { name: 'Privacy Policy' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/privacy');
    });

    test('social links open in a new tab safely', () => {
        renderWithRouter(<Footer />);
        for (const label of ['GitHub', 'LinkedIn', 'Instagram', 'Email']) {
            const link = screen.getByRole('link', { name: label });
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
        }
    });

    test('the email link uses the correct helpdesk address (regression for ".com.com")', () => {
        renderWithRouter(<Footer />);
        const href = screen.getByRole('link', { name: 'Email' }).getAttribute('href');
        expect(href).toContain('to=helpdesk.gamehub@gmail.com&');
        expect(href).not.toContain('.com.com');
    });

    test('shows the current year in the copyright line', () => {
        renderWithRouter(<Footer />);
        expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Game Data Hub`))).toBeInTheDocument();
    });
});

describe('Notfound (404 page)', () => {
    test('shows the 404 message', () => {
        renderWithRouter(<Notfound />);
        expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
    });

    test('"Back to Home" goes to the home page', () => {
        renderWithRouter(<Notfound />);
        const link = screen.getByRole('link', { name: /Back to Home/ });
        expect(link).toHaveAttribute('href', '/');

        fireEvent.click(link);
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });
});
