// Sends uncaught browser errors to the backend (POST /client-errors, grouped in errorLogs there).
// No account id, no IP stored; at most 5 reports per page load, duplicates skipped, dev builds only log.
import { API_BASE } from '../Components/apiCache.js';

const MAX_PER_PAGE = 5;
const seen = new Set();
let sent = 0;
let queue = [];
let timer = null;

const clip = (value, max) => String(value ?? '').slice(0, max);

function flush() {
    timer = null;
    if (!queue.length) return;
    const errors = queue;
    queue = [];
    // keepalive lets the request finish even when the page is being closed
    fetch(`${API_BASE}/client-errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
        keepalive: true,
    }).catch(() => {});
}

export function reportError(error, extra = {}) {
    const message = clip(error?.message || error, 500);
    if (!message) return;
    const key = `${message}|${clip(error?.stack, 200)}`;
    if (seen.has(key) || sent >= MAX_PER_PAGE) return;
    seen.add(key);
    sent++;
    const report = {
        name: clip(error?.name || 'Error', 80),
        message,
        stack: clip(error?.stack, 3000),
        path: clip(window.location.pathname, 200),
        url: clip(extra.source || '', 300),
        release: clip(import.meta.env.VITE_RELEASE || import.meta.env.MODE, 40),
    };
    if (import.meta.env.DEV) {
        console.warn('[error report, not sent in dev]', report);
        return;
    }
    queue.push(report);
    if (!timer) timer = setTimeout(flush, 2000);
}

let installed = false;

export function installErrorReporting() {
    if (installed || typeof window === 'undefined') return;
    installed = true;
    window.addEventListener('error', event => {
        // Resource load errors (img/script) have no error object: skip them, they are mostly blocked ads/extensions
        if (!event.error && !event.message) return;
        reportError(event.error || { name: 'Error', message: event.message, stack: '' }, { source: event.filename });
    });
    window.addEventListener('unhandledrejection', event => {
        const reason = event.reason;
        reportError(reason instanceof Error ? reason : { name: 'UnhandledRejection', message: clip(reason?.message || reason, 500), stack: '' });
    });
    window.addEventListener('pagehide', flush);
}
