import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';

const { signInWithEmailAndPassword } = vi.hoisted(() => ({ signInWithEmailAndPassword: vi.fn() }));
vi.mock('firebase/auth', () => ({ signInWithEmailAndPassword }));
// The real Header fetches stores/favorites; it is not what this test is about
vi.mock('../src/Header.jsx', () => ({ default: () => null }));

import Login from '../src/pages/Login.jsx';
import { renderWithRouter } from './helpers.jsx';

const fakeAuth = { name: 'fake-auth' };

function renderLogin() {
    renderWithRouter(<Login auth={fakeAuth} />, { route: '/login', path: '/login' });
    return {
        email: screen.getByPlaceholderText('Email address'),
        password: screen.getByPlaceholderText('Password'),
        button: screen.getByRole('button', { name: 'Sign In' }),
    };
}

describe('Login page', () => {
    beforeEach(() => {
        signInWithEmailAndPassword.mockReset();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    test('renders the form and the sign-up link', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sign up now' })).toHaveAttribute('href', '/signup');
    });

    test('successful login signs in with the typed data and goes to the home page', async () => {
        signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
        const { email, password, button } = renderLogin();

        fireEvent.change(email, { target: { value: 'player@example.com' } });
        fireEvent.change(password, { target: { value: 'secret123' } });
        await act(async () => { fireEvent.click(button); });

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(fakeAuth, 'player@example.com', 'secret123');
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });

    test('wrong credentials show an error and stay on the page', async () => {
        signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });
        const { email, password, button } = renderLogin();

        fireEvent.change(email, { target: { value: 'player@example.com' } });
        fireEvent.change(password, { target: { value: 'wrong' } });
        await act(async () => { fireEvent.click(button); });

        expect(screen.getByText('Wrong email or password! Please try again.')).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
        expect(button).not.toBeDisabled();
    });

    test('editing the email hides the error message', async () => {
        signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });
        const { email, button } = renderLogin();

        await act(async () => { fireEvent.click(button); });
        expect(screen.getByText('Wrong email or password! Please try again.')).toBeInTheDocument();

        fireEvent.change(email, { target: { value: 'p' } });
        expect(screen.queryByText('Wrong email or password! Please try again.')).not.toBeInTheDocument();
    });

    test('Enter in the password field submits', async () => {
        signInWithEmailAndPassword.mockResolvedValue({});
        const { password } = renderLogin();

        await act(async () => { fireEvent.keyDown(password, { key: 'Enter' }); });

        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    test('shows a loading state and ignores double submits', async () => {
        let finish;
        signInWithEmailAndPassword.mockImplementation(() => new Promise(r => { finish = r; }));
        const { password, button } = renderLogin();

        await act(async () => { fireEvent.click(button); });
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Signing in/ })).toBeDisabled();

        await act(async () => { fireEvent.keyDown(password, { key: 'Enter' }); });
        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);

        await act(async () => { finish({}); });
    });
});
