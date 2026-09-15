/* eslint-disable react/prop-types */
// Paste an OpenXBL key / PlayStation NPSSO to sync achievements.
// "Remember" (default) stores the key encrypted on the server for automatic syncs; otherwise it is used once.
import { useContext, useState } from 'react';
import { BsBoxArrowUpRight, BsExclamationTriangle } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { Field, Modal, inputClass } from '../community/ui.jsx';
import { PLATFORM_IMPORTS } from '../library/PlatformImport.jsx';
import { connectPlatform, errorCodeOf, startSync } from './achievementsApi.js';

export default function ConnectKeyModal({ platform, open, onClose, autoSyncAvailable = true, onStarted }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [credential, setCredential] = useState('');
    const [remember, setRemember] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const config = PLATFORM_IMPORTS[platform];
    if (!config) return null;
    const Icon = config.icon;

    const close = () => {
        if (busy) return;
        setCredential('');
        setError(null);
        onClose();
    };

    const submit = async event => {
        event.preventDefault();
        const value = credential.trim();
        if (!value || busy || !user) return;
        setBusy(true);
        setError(null);
        try {
            if (remember && autoSyncAvailable) await connectPlatform(user, platform, value, true);
            else await startSync(user, platform, value);
            setCredential('');
            onStarted?.();
            onClose();
        } catch (err) {
            setError(errorCodeOf(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal open={open} onClose={close} title={t(`achievements.connect.${platform}.title`)} subtitle={t('achievements.connect.subtitle')} maxWidth="max-w-lg">
            <form onSubmit={submit} className="space-y-4">
                <ol className="ml-5 list-decimal space-y-1.5 text-sm text-[#c9ccd4]">
                    <li>
                        {t(`profileExtras.import.${platform}.step1`)}{' '}
                        <a href={config.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#c4b5fd] hover:text-white">
                            {t('profileExtras.import.openLink')} <BsBoxArrowUpRight className="h-3 w-3" />
                        </a>
                    </li>
                    <li>{t(`profileExtras.import.${platform}.step2`)}</li>
                    <li>{t(`profileExtras.import.${platform}.step3`)}</li>
                </ol>
                <Field label={t(`profileExtras.import.${platform}.label`)}>
                    <input
                        type="password"
                        value={credential}
                        onChange={e => setCredential(e.target.value.slice(0, 300))}
                        className={inputClass}
                        autoComplete="off"
                        spellCheck="false"
                        autoFocus
                    />
                </Field>
                {autoSyncAvailable ? (
                    <label className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 cursor-pointer">
                        <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="mt-0.5 accent-[#8b5cf6]" />
                        <span className="text-sm text-[#c9ccd4]">
                            <span className="block font-semibold text-white">{t('achievements.connect.remember')}</span>
                            <span className="block text-xs text-[#8a8f9c] mt-0.5">{t(`achievements.connect.rememberHint.${platform}`)}</span>
                        </span>
                    </label>
                ) : (
                    <p className="text-xs text-[#8a8f9c]">{t('achievements.connect.onceOnly')}</p>
                )}
                {error && (
                    <p className="flex items-start gap-2 rounded-xl border border-[#fbbf24]/25 bg-[#fbbf24]/[0.07] p-3 text-sm font-semibold text-[#fcd34d]">
                        <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                        {t(`achievements.errors.${error}`)}
                    </p>
                )}
                <button type="submit" disabled={busy || !credential.trim()} className="gh-btn gh-btn-primary w-full !h-11">
                    <Icon aria-hidden="true" /> {busy ? t('achievements.connect.checking') : t('achievements.connect.submit')}
                </button>
            </form>
        </Modal>
    );
}
