import { useContext } from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
    authCallback: null,
    unsubscribe: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn((db, collection, id) => ({ path: `${collection}/${id}` })),
}));

vi.mock('firebase/auth', () => ({ onAuthStateChanged: mocks.onAuthStateChanged }));
vi.mock('../firebaseAuth.js', () => ({ auth: { name: 'fake-auth' } }));
vi.mock('firebase/firestore', () => ({ doc: mocks.doc, getDoc: mocks.getDoc, setDoc: mocks.setDoc }));
vi.mock('../firebaseConfig.js', () => ({ firestore: { name: 'fake-firestore' } }));

import { UserContext, UserProvider } from '../src/Features/UserContext.jsx';
import { dateKey } from '../src/Components/profile/profileUtils.js';

function Consumer() {
    const { user, profile, authReady } = useContext(UserContext);
    return (
        <>
            <span data-testid="ready">{String(authReady)}</span>
            <span data-testid="user">{user ? user.uid : 'none'}</span>
            <span data-testid="profile">{profile ? JSON.stringify(profile) : 'none'}</span>
        </>
    );
}

const snapshot = (data) => ({ exists: () => data !== null, data: () => ({ ...data }) });

async function renderProvider() {
    const utils = render(<UserProvider><Consumer /></UserProvider>);
    await waitFor(() => expect(mocks.authCallback).toBeTypeOf('function'));
    return utils;
}

const signIn = (user) => act(async () => { await mocks.authCallback(user); });

describe('UserProvider', () => {
    beforeEach(() => {
        mocks.authCallback = null;
        mocks.unsubscribe.mockReset();
        mocks.onAuthStateChanged.mockReset().mockImplementation((auth, cb) => {
            mocks.authCallback = cb;
            return mocks.unsubscribe;
        });
        mocks.getDoc.mockReset();
        mocks.setDoc.mockReset().mockResolvedValue(undefined);
    });

    test('starts with no user and authReady = false', async () => {
        await renderProvider();
        expect(screen.getByTestId('ready')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('none');
        expect(mocks.onAuthStateChanged).toHaveBeenCalledWith({ name: 'fake-auth' }, expect.any(Function));
    });

    test('signed-out visitor: authReady becomes true, profile stays empty', async () => {
        await renderProvider();
        await signIn(null);

        expect(screen.getByTestId('ready')).toHaveTextContent('true');
        expect(screen.getByTestId('profile')).toHaveTextContent('none');
        expect(mocks.getDoc).not.toHaveBeenCalled();
    });

    test('new user: username comes from the email and a profile doc is created', async () => {
        mocks.getDoc.mockResolvedValue(snapshot(null));
        await renderProvider();

        await signIn({ uid: 'u1', email: 'neo@matrix.io', displayName: null });

        expect(screen.getByTestId('user')).toHaveTextContent('u1');
        expect(screen.getByTestId('ready')).toHaveTextContent('true');
        const profile = JSON.parse(screen.getByTestId('profile').textContent);
        expect(profile).toMatchObject({ username: 'neo', streak: 1, activeDays: 1, lastActiveDate: dateKey(new Date()) });
        expect(mocks.doc).toHaveBeenCalledWith({ name: 'fake-firestore' }, 'users', 'u1');
        expect(mocks.setDoc).toHaveBeenCalledWith(
            { path: 'users/u1' },
            expect.objectContaining({ username: 'neo', streak: 1 }),
            { merge: true },
        );
    });

    test('displayName is preferred over the email', async () => {
        mocks.getDoc.mockResolvedValue(snapshot(null));
        await renderProvider();
        await signIn({ uid: 'u1', email: 'neo@matrix.io', displayName: 'The One' });
        expect(JSON.parse(screen.getByTestId('profile').textContent).username).toBe('The One');
    });

    test('returning user already active today: no write to Firestore', async () => {
        mocks.getDoc.mockResolvedValue(snapshot({ username: 'trinity', lastActiveDate: dateKey(new Date()), streak: 3 }));
        await renderProvider();

        await signIn({ uid: 'u2', email: 't@matrix.io' });

        expect(JSON.parse(screen.getByTestId('profile').textContent)).toMatchObject({ username: 'trinity', streak: 3 });
        expect(mocks.setDoc).not.toHaveBeenCalled();
    });

    test('Firestore failure falls back to a minimal profile but still finishes loading', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.getDoc.mockRejectedValue(new Error('permission-denied'));
        await renderProvider();

        await signIn({ uid: 'u3', email: 'morpheus@matrix.io' });

        expect(screen.getByTestId('profile')).toHaveTextContent('{"username":"morpheus"}');
        expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    test('signing out clears the user and the profile', async () => {
        mocks.getDoc.mockResolvedValue(snapshot(null));
        await renderProvider();
        await signIn({ uid: 'u1', email: 'neo@matrix.io' });

        await signIn(null);

        expect(screen.getByTestId('user')).toHaveTextContent('none');
        expect(screen.getByTestId('profile')).toHaveTextContent('none');
    });

    test('unsubscribes from Firebase on unmount', async () => {
        const { unmount } = await renderProvider();
        unmount();
        expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    });
});
