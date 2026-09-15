import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
    createUserWithEmailAndPassword: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn((db, collection, id) => ({ path: `${collection}/${id}` })),
}));
vi.mock('firebase/auth', () => ({ createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword }));
vi.mock('firebase/firestore', () => ({ setDoc: mocks.setDoc, doc: mocks.doc }));
vi.mock('../firebaseConfig.js', () => ({ firestore: { name: 'fake-firestore' } }));
vi.mock('../src/Header.jsx', () => ({ default: () => null }));

import SignUp from '../src/pages/SignUp.jsx';
import { renderWithRouter } from './helpers.jsx';

const fakeAuth = { name: 'fake-auth' };

function fillForm({ username = 'Neo', email = 'neo@matrix.io', password = 'redpill1', confirm = password, accept = true } = {}) {
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: username } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: password } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: confirm } });
    if (accept) fireEvent.click(screen.getByRole('checkbox'));
}

const submit = () => act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Create Account/ }));
});

describe('SignUp page', () => {
    beforeEach(() => {
        mocks.createUserWithEmailAndPassword.mockReset();
        mocks.setDoc.mockReset().mockResolvedValue(undefined);
        renderWithRouter(<SignUp auth={fakeAuth} />, { route: '/signup', path: '/signup' });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('renders the form and the sign-in link', () => {
        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    });

    test('rejects different passwords without calling Firebase', async () => {
        fillForm({ password: 'abcdef', confirm: 'abcdeg' });
        await submit();

        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    test('rejects passwords shorter than 6 characters', async () => {
        fillForm({ password: 'abc' });
        await submit();

        expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
        expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    test('requires accepting the Terms and Privacy Policy, which link to the legal pages', async () => {
        expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
        expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');

        fillForm({ accept: false });
        await submit();

        expect(screen.getByText('Please accept the Terms of Service and the Privacy Policy to create an account.')).toBeInTheDocument();
        expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    test('creates the account, stores the username and redirects to login after 2s', async () => {
        vi.useFakeTimers();
        mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'uid-42' } });

        fillForm();
        await submit();

        expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(fakeAuth, 'neo@matrix.io', 'redpill1');
        expect(mocks.doc).toHaveBeenCalledWith({ name: 'fake-firestore' }, 'users', 'uid-42');
        expect(mocks.setDoc).toHaveBeenCalledWith({ path: 'users/uid-42' }, expect.objectContaining({
            username: 'Neo',
            acceptedLegalVersion: expect.any(String),
            acceptedLegalAt: expect.any(String),
        }));
        expect(screen.getByText('Account created successfully! Redirecting to login...')).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent('/signup');

        await act(async () => { vi.advanceTimersByTime(2000); });
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });

    test('shows the Firebase error message', async () => {
        mocks.createUserWithEmailAndPassword.mockRejectedValue(new Error('Firebase: Error (auth/email-already-in-use).'));

        fillForm();
        await submit();

        expect(screen.getByText('Firebase: Error (auth/email-already-in-use).')).toBeInTheDocument();
        expect(screen.queryByText(/Account created successfully/)).not.toBeInTheDocument();
    });

    test('falls back to a generic message when Firebase gives none', async () => {
        mocks.createUserWithEmailAndPassword.mockRejectedValue({});

        fillForm();
        await submit();

        expect(screen.getByText('Failed to create an account.')).toBeInTheDocument();
    });

    test('Enter submits and double submits are ignored while loading', async () => {
        let finish;
        mocks.createUserWithEmailAndPassword.mockImplementation(() => new Promise(r => { finish = r; }));
        fillForm();

        const confirm = screen.getByPlaceholderText('Confirm Password');
        await act(async () => { fireEvent.keyDown(confirm, { key: 'Enter' }); });
        await act(async () => { fireEvent.keyDown(confirm, { key: 'Enter' }); });

        expect(screen.getByText('Creating account...')).toBeInTheDocument();
        expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);

        await act(async () => { finish({ user: { uid: 'x' } }); });
    });
});
