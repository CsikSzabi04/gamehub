/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { Field, Modal, RequireLogin, inputClass } from '../community/ui.jsx';
import { LIMITS, REPORT_REASONS } from './constants.js';
import { reportContent } from './lfgApi.js';
import { FormError } from './parts.jsx';

function ReportForm({ target, onClose }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [details, setDetails] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const submit = async e => {
        e.preventDefault();
        if (!user || saving) return;
        setSaving(true);
        setError('');
        try {
            const text = details.trim() ? `${reason}: ${details.trim()}` : reason;
            await reportContent(user, { type: target.type, targetId: target.targetId, postId: target.postId, reason: text.slice(0, LIMITS.reason) });
            setDone(true);
        } catch (err) {
            console.error('LFG report failed:', err);
            setError(t('lfg.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        return (
            <div className="text-center space-y-3 py-2">
                <BsCheckCircleFill className="mx-auto w-9 h-9 text-emerald-400" aria-hidden="true" />
                <p className="text-white font-semibold">{t('lfg.report.thanks')}</p>
                <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary w-full">{t('lfg.actions.close')}</button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label={t('lfg.report.reason')}>
                <select value={reason} onChange={e => setReason(e.target.value)} className={inputClass}>
                    {REPORT_REASONS.map(r => <option key={r} value={r}>{t(`lfg.report.reasons.${r}`)}</option>)}
                </select>
            </Field>
            <Field label={t('lfg.report.details')}>
                <textarea value={details} onChange={e => setDetails(e.target.value)} maxLength={LIMITS.reason - 20} rows={3} className={`${inputClass} !h-auto py-2 resize-none`} />
            </Field>
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary">{t('lfg.actions.cancel')}</button>
                <button type="submit" disabled={saving} className="gh-btn gh-btn-danger disabled:opacity-60">{saving ? t('lfg.actions.saving') : t('lfg.report.submit')}</button>
            </div>
        </form>
    );
}

/** target: { type: 'lfg' | 'lfg-user', targetId, postId, label } */
export default function ReportModal({ target, onClose }) {
    const { t } = useT();
    return (
        <Modal open={Boolean(target)} onClose={onClose} title={t(target?.type === 'lfg-user' ? 'lfg.report.userTitle' : 'lfg.report.postTitle')} subtitle={target?.label}>
            <RequireLogin message={t('lfg.loginToReport')}>
                {target && <ReportForm target={target} onClose={onClose} />}
            </RequireLogin>
        </Modal>
    );
}
