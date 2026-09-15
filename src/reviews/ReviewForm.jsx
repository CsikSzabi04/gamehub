import { useId, useState } from 'react';
import { BsChevronDown, BsX } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { inputClass } from '../community/ui.jsx';
import { StarInput } from './Stars.jsx';
import { ASPECTS, MAX_REVIEW_LENGTH, MAX_TAG_LENGTH, MAX_TAGS, MIN_REVIEW_LENGTH, PLATFORMS } from './reviewUtils.js';

const hasDetails = draft => Boolean(
    draft && (draft.playtimeHours !== '' || draft.platform || draft.pros.length || draft.cons.length || draft.spoiler
        || ASPECTS.some(key => draft.aspects[key] != null)),
);

function TagInput({ label, values, onChange, tone }) {
    const { t } = useT();
    const id = useId();
    const [text, setText] = useState('');
    const full = values.length >= MAX_TAGS;

    function add() {
        const value = text.trim().slice(0, MAX_TAG_LENGTH);
        if (!value || full) return;
        if (!values.some(v => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
        setText('');
    }

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">
                {label} <span className="normal-case font-normal text-[#6b7080]">· {t('reviewsPlus.tagLimit', { max: MAX_TAGS })}</span>
            </label>
            <div className="flex gap-2">
                <input
                    id={id}
                    type="text"
                    value={text}
                    maxLength={MAX_TAG_LENGTH}
                    disabled={full}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add();
                        }
                    }}
                    placeholder={t('reviewsPlus.tagPlaceholder')}
                    className={`${inputClass} disabled:opacity-50`}
                />
                <button type="button" onClick={add} disabled={full || !text.trim()} className="gh-btn gh-btn-secondary shrink-0">
                    {t('reviewsPlus.tagAdd')}
                </button>
            </div>
            {values.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {values.map(value => (
                        <li key={value} className={`inline-flex max-w-full items-center gap-1 rounded-md border pl-2 pr-1 py-0.5 text-xs ${tone === 'pro' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/25 bg-rose-500/10 text-rose-200'}`}>
                            <span className="truncate">{value}</span>
                            <button
                                type="button"
                                onClick={() => onChange(values.filter(v => v !== value))}
                                aria-label={t('reviewsPlus.tagRemove', { tag: value })}
                                className="p-1 rounded hover:bg-white/10"
                            >
                                <BsX aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** Write / edit form. `community` is the useGameCommunity() result. */
export default function ReviewForm({ community }) {
    const { t } = useT();
    const textId = useId();
    const detailsId = useId();
    const { newReview, setNewReview, rating, setRating, draft, setDraft, editingId, cancelEdit, submitting, submitReview, reviewError, myReview } = community;
    const [open, setOpen] = useState(() => hasDetails(draft));

    const length = newReview.trim().length;
    const patch = values => setDraft(prev => ({ ...prev, ...values }));
    const setAspect = (key, value) => setDraft(prev => ({ ...prev, aspects: { ...prev.aspects, [key]: value } }));

    return (
        <form
            className="gh-surface p-4 sm:p-5 mb-4"
            onSubmit={e => {
                e.preventDefault();
                submitReview({ minLength: MIN_REVIEW_LENGTH });
            }}
        >
            <label htmlFor={textId} className="block text-sm font-semibold text-white">
                {t(editingId ? 'reviewsPlus.updateTitle' : 'reviewsPlus.writeTitle')}
            </label>
            {!editingId && myReview && <p className="text-xs text-[#a1a6b3] mt-1">{t('reviewsPlus.alreadyReviewed')}</p>}

            <div className="mt-3 flex items-center justify-between sm:justify-start gap-3">
                <span className="text-sm text-[#a1a6b3]">{t('reviewsPlus.yourRating')}</span>
                <StarInput value={rating} onChange={setRating} label={t('reviewsPlus.yourRating')} />
            </div>

            <textarea
                id={textId}
                value={newReview}
                onChange={e => setNewReview(e.target.value)}
                maxLength={MAX_REVIEW_LENGTH}
                className="gh-input resize-y min-h-[112px] mt-3"
                rows="4"
                placeholder={t('reviewsPlus.placeholder')}
            />
            <p className={`mt-1 text-right text-xs tabular-nums ${length >= MIN_REVIEW_LENGTH ? 'text-emerald-400' : 'text-[#6b7080]'}`}>
                {t('reviewsPlus.charCount', { count: length, min: MIN_REVIEW_LENGTH })}
            </p>

            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                aria-controls={detailsId}
                className="mt-1 -ml-1 inline-flex items-center gap-2 h-9 px-1 text-sm font-semibold text-[#c4b5fd] hover:text-white"
            >
                <BsChevronDown aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                {t('reviewsPlus.details')}
                <span className="text-xs font-normal text-[#6b7080]">({t('reviewsPlus.detailsHint')})</span>
            </button>

            {open && (
                <div id={detailsId} className="mt-3 space-y-5 border-t border-white/[0.06] pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('reviewsPlus.playtimeLabel')}</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                max="100000"
                                step="0.5"
                                value={draft.playtimeHours}
                                onChange={e => patch({ playtimeHours: e.target.value })}
                                className={inputClass}
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('reviewsPlus.platformLabel')}</span>
                            <select value={draft.platform} onChange={e => patch({ platform: e.target.value })} className={inputClass}>
                                <option value="">{t('reviewsPlus.platformNone')}</option>
                                {PLATFORMS.map(p => <option key={p} value={p}>{t(`reviewsPlus.platforms.${p}`)}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TagInput label={t('reviewsPlus.prosLabel')} values={draft.pros} onChange={pros => patch({ pros })} tone="pro" />
                        <TagInput label={t('reviewsPlus.consLabel')} values={draft.cons} onChange={cons => patch({ cons })} tone="con" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1">{t('reviewsPlus.aspectsLabel')}</p>
                        <ul className="divide-y divide-white/[0.05]">
                            {ASPECTS.map(key => (
                                <li key={key} className="flex items-center justify-between gap-2 py-1">
                                    <span className="min-w-0 truncate text-sm text-[#c9ccd4]">{t(`reviewsPlus.aspects.${key}`)}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <StarInput value={draft.aspects[key] || 0} onChange={value => setAspect(key, value)} size="sm" label={t(`reviewsPlus.aspects.${key}`)} />
                                        <button
                                            type="button"
                                            onClick={() => setAspect(key, null)}
                                            disabled={draft.aspects[key] == null}
                                            aria-label={`${t('reviewsPlus.clearAspect')}: ${t(`reviewsPlus.aspects.${key}`)}`}
                                            className="p-1.5 rounded text-[#6b7080] hover:text-white disabled:invisible"
                                        >
                                            <BsX aria-hidden="true" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-[#c9ccd4] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={draft.spoiler}
                            onChange={e => patch({ spoiler: e.target.checked })}
                            className="h-4 w-4 accent-[#8b5cf6]"
                        />
                        {t('reviewsPlus.spoilerLabel')}
                    </label>
                </div>
            )}

            {reviewError && <p className="text-sm text-red-400 mt-3" role="alert">{reviewError}</p>}

            <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                {editingId && (
                    <button type="button" onClick={cancelEdit} className="gh-btn gh-btn-secondary !h-11 sm:!h-10 w-full sm:w-auto">
                        {t('reviewsPlus.cancelEdit')}
                    </button>
                )}
                <button type="submit" disabled={submitting} className="gh-btn gh-btn-primary !h-11 sm:!h-10 w-full sm:w-auto">
                    {submitting ? t('reviewsPlus.posting') : t(editingId ? 'reviewsPlus.save' : 'reviewsPlus.post')}
                </button>
            </div>
        </form>
    );
}
