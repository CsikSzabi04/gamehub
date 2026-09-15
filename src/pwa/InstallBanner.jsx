// Small "Get the app" banner on phones, from the second visit on. Dismissal is remembered for 30 days.
import { useEffect, useState } from 'react';
import { BsX } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { useInstall } from './install.js';
import InstallAppModal from './InstallAppModal.jsx';
import { preferenceStorage } from '../consent/consent.js';

const VISITS_KEY = 'gdh-visits';
const DISMISS_KEY = 'gdh-install-dismissed';

function shouldOffer() {
    // Without "preferences" consent nothing is counted, so the banner is simply not offered
    const visits = Number(preferenceStorage.get(VISITS_KEY) || 0) + 1;
    preferenceStorage.set(VISITS_KEY, visits);
    const dismissed = Number(preferenceStorage.get(DISMISS_KEY) || 0);
    return visits >= 2 && Date.now() - dismissed > 30 * 24 * 3600 * 1000;
}

export default function InstallBanner() {
    const { t } = useT();
    const { installed, canPrompt, ios } = useInstall();
    const [offer] = useState(shouldOffer);
    const [hidden, setHidden] = useState(false);
    const [modal, setModal] = useState(false);
    const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px)');
        const fn = () => setMobile(media.matches);
        media.addEventListener?.('change', fn);
        return () => media.removeEventListener?.('change', fn);
    }, []);

    if (installed || !offer || hidden || !mobile || !(canPrompt || ios)) {
        return <InstallAppModal open={modal} onClose={() => setModal(false)} />;
    }

    const dismiss = () => {
        preferenceStorage.set(DISMISS_KEY, Date.now());
        setHidden(true);
    };

    return (
        <>
            <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[180] flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#15171f]/95 backdrop-blur px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                <img src="/icons/icon-192.png" alt="" width="40" height="40" className="h-10 w-10 rounded-xl" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white leading-tight">{t('pwa.bannerTitle')}</p>
                    <p className="text-xs text-[#8a8f9c] truncate">{t('pwa.bannerText')}</p>
                </div>
                <button onClick={() => setModal(true)} className="gh-btn gh-btn-primary !h-9 !px-3 shrink-0">{t('pwa.bannerButton')}</button>
                <button onClick={dismiss} aria-label={t('pwa.dismiss')} className="p-1 rounded-md text-[#8a8f9c] hover:text-white shrink-0">
                    <BsX className="w-5 h-5" />
                </button>
            </div>
            <InstallAppModal open={modal} onClose={() => { setModal(false); dismiss(); }} />
        </>
    );
}
