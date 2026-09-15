import { useState } from 'react';
import { Modal } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { REPORT_REASONS } from './reviewUtils.js';

/**
 * Report dialog. onSubmit(reason) -> Promise<{ ok, alreadyReported?, error? }>
 * Mount it with a `key` per review so its state resets.
 */
export default function ReportReviewModal({ open, onClose, onSubmit }) {
    const { t } = useT();
    const [reason, setReason] = useState('spam');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    async function send() {
        setSending(true);
        const response = await onSubmit(reason);
        setSending(false);
        setResult(response);
    }

    const done = result?.ok;

    return (
        <Modal open={open} onClose={onClose} title={t('reviewsPlus.reportTitle')} subtitle={done ? null : t('reviewsPlus.reportSubtitle')}>
            {done ? (
                <div className="text-center py-2">
                    <p className="text-sm text-[#c9ccd4]">{result.alreadyReported ? t('reviewsPlus.reportAlready') : t('reviewsPlus.reportThanks')}</p>
                    <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary mt-5 w-full sm:w-auto">{t('reviewsPlus.close')}</button>
                </div>
            ) : (
                <>
                    <fieldset className="space-y-2">
                        <legend className="sr-only">{t('reviewsPlus.reportSubtitle')}</legend>
                        {REPORT_REASONS.map(value => (
                            <label
                                key={value}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer text-sm transition-colors ${reason === value ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-white' : 'border-white/[0.08] text-[#c9ccd4] hover:bg-white/[0.04]'}`}
                            >
                                <input
                                    type="radio"
                                    name="report-reason"
                                    value={value}
                                    checked={reason === value}
                                    onChange={() => setReason(value)}
                                    className="accent-[#8b5cf6]"
                                />
                                {t(`reviewsPlus.reasons.${value}`)}
                            </label>
                        ))}
                    </fieldset>
                    {result?.error && <p className="text-sm text-red-400 mt-3">{result.error}</p>}
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary w-full sm:w-auto">{t('reviewsPlus.cancel')}</button>
                        <button type="button" onClick={send} disabled={sending} className="gh-btn gh-btn-danger w-full sm:w-auto">{t('reviewsPlus.reportSend')}</button>
                    </div>
                </>
            )}
        </Modal>
    );
}
