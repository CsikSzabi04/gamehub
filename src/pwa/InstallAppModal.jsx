import { BsBoxArrowUp, BsCheckCircleFill, BsDownload, BsPlusSquare, BsThreeDotsVertical } from 'react-icons/bs';
import { Modal } from '../community/Modal.jsx';
import { useT } from '../i18n/index.jsx';
import { useInstall } from './install.js';

function Step({ n, icon: Icon, children }) {
    return (
        <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-white">{n}</span>
            <span className="text-sm text-[#c9ccd4] pt-1">
                {children} {Icon && <Icon className="inline-block ml-1 -mt-0.5 text-[#c4b5fd]" aria-hidden="true" />}
            </span>
        </li>
    );
}

/** Explains / triggers installing GameDataHub as an app (Android, desktop, iOS). */
export default function InstallAppModal({ open, onClose }) {
    const { t } = useT();
    const { installed, canPrompt, ios, promptInstall } = useInstall();

    async function install() {
        const outcome = await promptInstall();
        if (outcome === 'accepted') onClose();
    }

    return (
        <Modal open={open} onClose={onClose} title={t('pwa.title')} subtitle={t('pwa.subtitle')}>
            <div className="flex items-center gap-4 mb-5">
                <img src="/icons/icon-192.png" alt="" width="64" height="64" className="h-16 w-16 rounded-2xl" />
                <ul className="text-sm text-[#c9ccd4] space-y-1">
                    <li>✓ {t('pwa.benefitHome')}</li>
                    <li>✓ {t('pwa.benefitPush')}</li>
                    <li>✓ {t('pwa.benefitFast')}</li>
                </ul>
            </div>

            {installed ? (
                <p className="flex items-center gap-2 text-sm text-emerald-400"><BsCheckCircleFill /> {t('pwa.alreadyInstalled')}</p>
            ) : canPrompt ? (
                <button onClick={install} className="gh-btn gh-btn-primary w-full !h-11">
                    <BsDownload /> {t('pwa.installNow')}
                </button>
            ) : ios ? (
                <ol className="space-y-3">
                    <Step n={1} icon={BsBoxArrowUp}>{t('pwa.iosStep1')}</Step>
                    <Step n={2} icon={BsPlusSquare}>{t('pwa.iosStep2')}</Step>
                    <Step n={3}>{t('pwa.iosStep3')}</Step>
                    <li className="text-xs text-[#6b7080] pt-1">{t('pwa.iosNote')}</li>
                </ol>
            ) : (
                <ol className="space-y-3">
                    <Step n={1} icon={BsThreeDotsVertical}>{t('pwa.otherStep1')}</Step>
                    <Step n={2} icon={BsDownload}>{t('pwa.otherStep2')}</Step>
                    <li className="text-xs text-[#6b7080] pt-1">{t('pwa.otherNote')}</li>
                </ol>
            )}
        </Modal>
    );
}
