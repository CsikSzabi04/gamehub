// Shared building blocks for the community pages (library, LFG, calendar, alerts ...).
import { lazy, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header.jsx';
import LazySection from '../Components/LazySection.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';

export { Modal } from './Modal.jsx';

const Footer = lazy(() => import('../Footer.jsx'));

/** Page with the site header/footer and a title block. `actions` renders on the right of the title. */
export function PageShell({ eyebrow, title, subtitle, actions, children, wide = false }) {
    useEffect(() => {
        if (title) document.title = `${title} · GameDataHub`;
    }, [title]);

    return (
        <div className="min-h-screen">
            <Header />
            <main className={`${wide ? 'max-w-[1440px]' : 'max-w-6xl'} mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 text-white`}>
                {(title || eyebrow) && (
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="min-w-0">
                            {eyebrow && <p className="gh-eyebrow mb-2">{eyebrow}</p>}
                            {title && <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>}
                            {subtitle && <p className="text-[#a1a6b3] mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
                    </div>
                )}
                {children}
            </main>
            <LazySection placeholder={false}><Footer /></LazySection>
        </div>
    );
}

/** Renders children for signed-in users, otherwise a log-in card. Waits for auth before deciding. */
export function RequireLogin({ children, message }) {
    const { user, authReady } = useContext(UserContext) || {};
    const { t } = useT();
    if (!authReady) return <Spinner />;
    if (!user) {
        return (
            <div className="gh-surface p-8 text-center max-w-md mx-auto">
                <p className="text-white font-semibold">{t('communityUi.loginTitle')}</p>
                <p className="text-sm text-[#a1a6b3] mt-2">{message || t('communityUi.loginText')}</p>
                <Link to="/login" className="gh-btn gh-btn-primary mt-5 inline-flex">{t('communityUi.login')}</Link>
            </div>
        );
    }
    return children;
}

export function Spinner({ className = 'py-16' }) {
    return (
        <div className={`flex justify-center ${className}`} role="status" aria-label="Loading">
            <span className="h-8 w-8 rounded-full border-2 border-white/10 border-t-[#8b5cf6] animate-spin" />
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <div className="gh-surface px-6 py-12 text-center">
            {Icon && <Icon className="mx-auto text-[#3a3f4b] text-4xl mb-4" aria-hidden="true" />}
            {title && <p className="text-white font-semibold">{title}</p>}
            {text && <p className="text-sm text-[#a1a6b3] mt-1.5 max-w-md mx-auto">{text}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

/** Pill-style tab bar. tabs: [{ id, label, count? }] */
export function Tabs({ tabs, value, onChange, className = '' }) {
    return (
        <div className={`flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 ${className}`} role="tablist">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={value === tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`shrink-0 h-9 px-3.5 rounded-lg text-sm font-medium transition-colors ${value === tab.id ? 'bg-white text-[#0a0b0f]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                >
                    {tab.label}
                    {tab.count != null && <span className={`ml-1.5 text-xs ${value === tab.id ? 'text-[#4b5060]' : 'text-[#6b7080]'}`}>{tab.count}</span>}
                </button>
            ))}
        </div>
    );
}

/** Small labelled form field wrapper. */
export function Field({ label, hint, children }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{label}</span>
            {children}
            {hint && <span className="block text-xs text-[#6b7080] mt-1">{hint}</span>}
        </label>
    );
}

export const inputClass = 'w-full h-10 rounded-lg bg-[#0a0b0f] border border-white/[0.1] px-3 text-sm text-white placeholder:text-[#6b7080] focus:outline-none focus:border-[#8b5cf6]';
export const cardClass = 'rounded-xl bg-[#111319] border border-white/[0.06]';
