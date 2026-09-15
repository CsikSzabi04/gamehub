// App-wide background work: service worker, push re-sync on sign-in, notification clicks,
// public profile mirror and the install banner. Rendered once next to the router (not inside a page).
// Everything heavy is imported after the first paint.
import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { onServiceWorkerMessage, registerServiceWorker } from './registerSW.js';
import { getConsent, subscribeConsent } from '../consent/consent.js';

const InstallBanner = lazy(() => import('./InstallBanner.jsx'));
const CookieConsent = lazy(() => import('../consent/CookieConsent.jsx'));

function afterLoad(fn, delay) {
    const run = () => setTimeout(fn, delay);
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

export default function AppRuntime({ navigate }) {
    const { user, profile } = useContext(UserContext) || {};
    const [ready, setReady] = useState(false);
    // The install banner waits until the cookie choice is made, so the two never overlap
    const [consentDecided, setConsentDecided] = useState(() => Boolean(getConsent()));

    useEffect(() => subscribeConsent(event => {
        if (event.type === 'change') setConsentDecided(true);
    }), []);

    useEffect(() => {
        afterLoad(() => {
            registerServiceWorker();
            setReady(true);
        }, 1500);
    }, []);

    useEffect(() => onServiceWorkerMessage(message => {
        if (message.type === 'gdh-navigate' && message.url) {
            const url = new URL(message.url, window.location.origin);
            if (url.origin === window.location.origin) navigate(url.pathname + url.search + url.hash);
        }
        if (message.type === 'gdh-resubscribe' && user) import('../notifications/push.js').then(({ syncPush }) => syncPush(user));
    }), [navigate, user]);

    // Signed in on a device that already allowed notifications: make sure it is saved for this account
    useEffect(() => {
        if (!user?.uid) return undefined;
        const timer = setTimeout(() => import('../notifications/push.js').then(({ syncPush }) => syncPush(user)), 4000);
        return () => clearTimeout(timer);
    }, [user]);

    // Keep the public profile mirror (publicProfiles/{uid}) up to date
    useEffect(() => {
        if (!user?.uid || !profile?.username) return undefined;
        const timer = setTimeout(() => {
            import('../social/publicProfile.js')
                .then(({ syncPublicProfile }) => syncPublicProfile(user, profile))
                .catch(error => console.error('Public profile sync failed:', error));
        }, 2500);
        return () => clearTimeout(timer);
    }, [user, profile]);

    return (
        <Suspense fallback={null}>
            <CookieConsent navigate={navigate} />
            {ready && consentDecided && <InstallBanner />}
        </Suspense>
    );
}
