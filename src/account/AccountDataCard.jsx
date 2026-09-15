/* eslint-disable react/prop-types */
// Profile → Account: download all personal data (GDPR Art. 15/20) and delete the account (Art. 17).
// Deleting needs a fresh sign-in: the password is re-checked, then the backend removes everything.
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { FaDownload, FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';
import { auth } from '../../firebaseConfig';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { Modal, Field, inputClass } from '../community/ui.jsx';
import { API_BASE, apiPost } from '../lib/api.js';

export default function AccountDataCard() {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const download = async () => {
        setExporting(true);
        setExportError('');
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/account/export`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gamedatahub-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) {
            setExportError(t(error.status === 429 ? 'account.exportCooldown' : error.status === 404 ? 'account.notDeployed' : 'account.exportError'));
        } finally {
            setExporting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
            <div>
                <p className="text-sm font-semibold text-white">{t('account.dataTitle')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('account.dataText')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" onClick={download} disabled={exporting} className="gh-btn gh-btn-secondary !h-10">
                    <FaDownload className="w-3.5 h-3.5" aria-hidden="true" /> {exporting ? t('account.exporting') : t('account.export')}
                </button>
                <button type="button" onClick={() => setDeleting(true)} className="gh-btn gh-btn-danger !h-10 sm:ml-auto">
                    <FaTrashAlt className="w-3.5 h-3.5" aria-hidden="true" /> {t('account.delete')}
                </button>
            </div>
            {exportError && <p className="text-xs text-red-400" role="alert">{exportError}</p>}
            {deleting && <DeleteAccountModal onClose={() => setDeleting(false)} />}
        </div>
    );
}

function DeleteAccountModal({ onClose }) {
    const { t } = useT();
    const navigate = useNavigate();
    const { user, setProfile } = useContext(UserContext) || {};
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const word = t('account.confirmWord');
    const passwordUser = auth.currentUser?.providerData?.some(p => p.providerId === 'password');
    const ready = confirmText.trim().toUpperCase() === word.toUpperCase() && (!passwordUser || password.length > 0);

    const submit = async event => {
        event.preventDefault();
        if (!ready || busy) return;
        setBusy(true);
        setError('');
        try {
            if (passwordUser) {
                await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, password));
            }
            // A fresh token carries the new auth_time the backend checks
            await auth.currentUser.getIdToken(true);
            const uid = auth.currentUser.uid;
            await apiPost('/account/delete', { confirm: true }, auth.currentUser);
            try {
                // Per-account keys (level, public profile sync ...); other accounts on this device keep theirs
                Object.keys(localStorage).filter(key => key.includes(uid)).forEach(key => localStorage.removeItem(key));
            } catch {
                // storage unavailable
            }
            await signOut(auth).catch(() => {});
            setProfile?.(null);
            navigate('/', { replace: true, state: { accountDeleted: true } });
        } catch (err) {
            const code = err?.code || err?.data?.code;
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') setError(t('account.wrongPassword'));
            else if (code === 'auth/too-many-requests') setError(t('account.tooManyAttempts'));
            else if (code === 'reauth_required' || code === 'auth/requires-recent-login') setError(t('account.reauthRequired'));
            else if (err?.status === 404) setError(t('account.notDeployed'));
            else setError(t('account.deleteError'));
            setBusy(false);
        }
    };

    return (
        <Modal open onClose={() => !busy && onClose()} title={t('account.deleteTitle')} subtitle={user?.email || ''} maxWidth="max-w-md">
            <form onSubmit={submit} className="space-y-4">
                <div className="flex gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] p-3 text-sm text-red-200">
                    <FaExclamationTriangle className="mt-0.5 w-4 h-4 shrink-0 text-red-400" aria-hidden="true" />
                    <div>
                        <p className="font-semibold">{t('account.deleteWarning')}</p>
                        <p className="text-xs text-red-200/80 mt-1">{t('account.deleteList')}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-400">{t('account.exportFirst')}</p>
                {passwordUser && (
                    <Field label={t('account.password')}>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" autoFocus />
                    </Field>
                )}
                <Field label={t('account.typeToConfirm', { word })}>
                    <input value={confirmText} onChange={e => setConfirmText(e.target.value.slice(0, 40))} className={inputClass} autoComplete="off" spellCheck="false" />
                </Field>
                {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={busy} className="gh-btn gh-btn-secondary !h-10">{t('common.cancel')}</button>
                    <button type="submit" disabled={!ready || busy} className="gh-btn gh-btn-danger !h-10">
                        {busy ? t('account.deleting') : t('account.deleteForever')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
