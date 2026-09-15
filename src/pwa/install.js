// "Install app" support: keeps the browser's beforeinstallprompt event for a button click.
import { useEffect, useState } from 'react';
import { isIos, isStandalone } from './platform.js';

let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredPrompt = event;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        try {
            localStorage.setItem('gdh-installed', '1');
        } catch {
            // storage unavailable
        }
        notify();
    });
}

/** { installed, canPrompt, ios, promptInstall } */
export function useInstall() {
    const [, force] = useState(0);
    useEffect(() => {
        const fn = () => force(n => n + 1);
        listeners.add(fn);
        const media = window.matchMedia?.('(display-mode: standalone)');
        media?.addEventListener?.('change', fn);
        return () => {
            listeners.delete(fn);
            media?.removeEventListener?.('change', fn);
        };
    }, []);

    return {
        installed: isStandalone(),
        canPrompt: Boolean(deferredPrompt),
        ios: isIos(),
        async promptInstall() {
            if (!deferredPrompt) return 'unavailable';
            const event = deferredPrompt;
            deferredPrompt = null;
            event.prompt();
            const choice = await event.userChoice.catch(() => ({ outcome: 'dismissed' }));
            notify();
            return choice.outcome;
        },
    };
}
