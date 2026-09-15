// "Turn on notifications on this device" card. Hides itself when push is already on,
// when the user is signed out, or when the browser can't do push at all.
import { useState } from 'react';
import { BsBellFill, BsBoxArrowUp, BsX } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import usePush from './usePush.js';
import InstallAppModal from '../pwa/InstallAppModal.jsx';
import { preferenceStorage } from '../consent/consent.js';

const DISMISS_KEY = 'gdh-push-prompt-dismissed';

function wasDismissed() {
    return Number(preferenceStorage.get(DISMISS_KEY) || 0) > Date.now() - 7 * 24 * 3600 * 1000;
}

/**
 * @param {{ compact?: boolean, force?: boolean }} props
 *   compact: smaller inline version (used after setting an alert)
 *   force: ignore the 7-day dismissal (settings page)
 */
export default function EnablePushPrompt({ compact = false, force = false }) {
    const { t } = useT();
    const { user, support, permission, subscribed, busy, error, enable } = usePush();
    const [dismissed, setDismissed] = useState(() => !force && wasDismissed());
    const [installOpen, setInstallOpen] = useState(false);

    if (!user || dismissed || subscribed !== false || support === 'unsupported') return null;

    const dismiss = () => {
        preferenceStorage.set(DISMISS_KEY, Date.now());
        setDismissed(true);
    };

    const iosInstall = support === 'ios-needs-install';
    const denied = permission === 'denied' || error === 'denied';

    return (
        <div className={`relative rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/[0.07] ${compact ? 'p-3 mt-3' : 'p-4 sm:p-5'}`}>
            {!force && (
                <button onClick={dismiss} aria-label={t('notifications.dismiss')} className="absolute top-2 right-2 p-1 rounded-md text-[#8a8f9c] hover:text-white hover:bg-white/[0.06]">
                    <BsX className="w-5 h-5" />
                </button>
            )}
            <div className="flex items-start gap-3 pr-6">
                <span className={`flex shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/20 text-[#c4b5fd] ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}>
                    <BsBellFill className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                        {iosInstall ? t('notifications.promptIosTitle') : t('notifications.promptTitle')}
                    </p>
                    {!compact && (
                        <p className="text-xs sm:text-sm text-[#a1a6b3] mt-1">
                            {iosInstall ? t('notifications.promptIosText') : denied ? t('notifications.promptDenied') : t('notifications.promptText')}
                        </p>
                    )}
                    {compact && denied && <p className="text-xs text-[#a1a6b3] mt-1">{t('notifications.promptDenied')}</p>}
                    {!denied && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {iosInstall ? (
                                <button onClick={() => setInstallOpen(true)} className="gh-btn gh-btn-primary !h-9">
                                    <BsBoxArrowUp /> {t('notifications.howToInstall')}
                                </button>
                            ) : (
                                <button onClick={enable} disabled={busy} className="gh-btn gh-btn-primary !h-9">
                                    {busy ? t('notifications.enabling') : t('notifications.enable')}
                                </button>
                            )}
                        </div>
                    )}
                    {error && !denied && error !== 'dismissed' && <p className="text-xs text-red-400 mt-2">{t('notifications.enableFailed')}</p>}
                </div>
            </div>
            <InstallAppModal open={installOpen} onClose={() => setInstallOpen(false)} />
        </div>
    );
}
