import { useEffect, useRef, useState } from 'react';
import { useT, loadNamespaces } from '../i18n/index.jsx';
import {
    OPTIONAL_CATEGORIES, acceptAll, getConsent, rejectAll, saveConsent, subscribeConsent,
} from './consent.js';

// Categories with no tool behind them today (shown as "not used at the moment")
const UNUSED = ['analytics', 'marketing'];

function Toggle({ checked, disabled, onChange, labelledBy }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelledBy}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'bg-[#8b5cf6]' : 'bg-white/15'}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
    );
}

/**
 * First-visit cookie / storage consent banner. Rejecting is as easy as accepting, nothing optional is
 * pre-selected, and the site stays usable while it is open (no cookie wall).
 * Re-opened from the footer and the Cookie Policy via openCookieSettings().
 */
export default function CookieConsent({ navigate }) {
    const { t } = useT();
    const [open, setOpen] = useState(() => !getConsent());
    const [customizing, setCustomizing] = useState(false);
    const [choices, setChoices] = useState(() => ({ ...getConsent() }));
    const [textReady, setTextReady] = useState(false);
    const titleRef = useRef(null);

    useEffect(() => {
        loadNamespaces(['consent']).then(() => setTextReady(true));
    }, []);

    useEffect(() => subscribeConsent(event => {
        if (event.type !== 'open') return;
        setChoices({ ...getConsent() });
        setCustomizing(true);
        setOpen(true);
        setTimeout(() => titleRef.current?.focus(), 0);
    }), []);

    if (!open || !textReady) return null;

    const finish = action => {
        action();
        setOpen(false);
        setCustomizing(false);
    };

    const goTo = path => event => {
        if (!navigate || event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        navigate(path);
    };

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-consent-title"
            className="fixed inset-x-0 bottom-0 z-[300] border-t border-white/[0.08] bg-[#0a0b0f]/[0.97] backdrop-blur shadow-[0_-16px_40px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
        >
            <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5 max-h-[80svh] overflow-y-auto overscroll-contain" data-lenis-prevent>
                <button
                    type="button"
                    onClick={() => finish(rejectAll)}
                    aria-label={t('consent.close')}
                    title={t('consent.close')}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 p-1.5 rounded-lg text-[#6b7080] hover:text-white hover:bg-white/[0.06]"
                >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>

                <h2 id="cookie-consent-title" ref={titleRef} tabIndex={-1} className="!mb-1 pr-10 text-base sm:text-lg font-bold text-white outline-none">
                    {t('consent.title')}
                </h2>
                <p className="text-sm leading-relaxed text-[#a1a6b3] max-w-4xl">{t('consent.text')}</p>

                {customizing && (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {['necessary', ...OPTIONAL_CATEGORIES].map(category => {
                            const necessary = category === 'necessary';
                            const unused = UNUSED.includes(category);
                            return (
                                <li key={category} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                                    <div className="min-w-0 flex-1">
                                        <p id={`consent-${category}`} className="text-sm font-semibold text-white">
                                            {t(`consent.categories.${category}.name`)}
                                            {(necessary || unused) && (
                                                <span className="ml-2 align-middle rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#8a8f9c]">
                                                    {necessary ? t('consent.alwaysOn') : t('consent.notUsed')}
                                                </span>
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-[#8a8f9c]">{t(`consent.categories.${category}.desc`)}</p>
                                    </div>
                                    <Toggle
                                        labelledBy={`consent-${category}`}
                                        checked={necessary || Boolean(choices[category])}
                                        disabled={necessary}
                                        onChange={value => setChoices(prev => ({ ...prev, [category]: value }))}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <button type="button" onClick={() => finish(acceptAll)} className="gh-btn gh-btn-secondary !h-10">{t('consent.acceptAll')}</button>
                    <button type="button" onClick={() => finish(rejectAll)} className="gh-btn gh-btn-secondary !h-10">{t('consent.rejectAll')}</button>
                    {customizing ? (
                        <button type="button" onClick={() => finish(() => saveConsent(choices))} className="gh-btn gh-btn-primary !h-10">{t('consent.save')}</button>
                    ) : (
                        <button type="button" onClick={() => setCustomizing(true)} className="gh-btn !h-10 border border-white/[0.08] text-[#c9ccd4] hover:text-white hover:bg-white/[0.05]">
                            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            {t('consent.customize')}
                        </button>
                    )}
                    <span className="flex flex-wrap gap-x-3 text-sm">
                        <a href="/cookies" onClick={goTo('/cookies')} className="underline underline-offset-2 text-[#c9ccd4] hover:text-white">{t('consent.learnMore')}</a>
                        <a href="/privacy" onClick={goTo('/privacy')} className="underline underline-offset-2 text-[#8a8f9c] hover:text-white">{t('consent.privacyPolicy')}</a>
                    </span>
                </div>
            </div>
        </div>
    );
}
