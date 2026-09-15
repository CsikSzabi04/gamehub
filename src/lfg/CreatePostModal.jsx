/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react';
import { BsCheckCircleFill, BsMic } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { Field, Modal, RequireLogin, inputClass } from '../community/ui.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { postActivity } from '../social/activity.js';
import {
    AGE_GROUPS, DURATIONS, LANGUAGE_CODES, LIMITS, MODES, OTHER_GAME, PLATFORMS, REGIONS,
    ageKey, createdMillis, isExpired, languageName, sameGame, validatePost,
} from './constants.js';
import { createPost, fetchOwnPosts } from './lfgApi.js';
import { FormError, SafetyNote } from './parts.jsx';

const DAY = 24 * 60 * 60 * 1000;

const initialForm = (game, lang) => ({
    game: game || '',
    gameName: '',
    platform: 'pc',
    mode: 'casual',
    rank: '',
    language: LANGUAGE_CODES.includes(lang) ? lang : 'any',
    region: 'any',
    mic: false,
    ageGroup: 'any',
    slots: 2,
    when: 'now',
    whenAt: '',
    duration: 6,
    note: '',
});

/** "2026-09-15T18:30" in local time for datetime-local inputs. */
function localInputValue(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CreateForm({ universes, initialGame, loadedOwnPosts, onCreated, onClose }) {
    const { t, lang, locale } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const [form, setForm] = useState(() => initialForm(initialGame, lang));
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [ownPosts, setOwnPosts] = useState(null);
    const [createdId, setCreatedId] = useState(null);

    // Full own post history (also expired posts) for the daily limit; falls back to the loaded posts
    useEffect(() => {
        if (!user?.uid) return undefined;
        let active = true;
        fetchOwnPosts(user.uid)
            .then(list => active && setOwnPosts(list))
            .catch(() => active && setOwnPosts(null));
        return () => { active = false; };
    }, [user?.uid]);

    const set = key => e => {
        const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const submit = async e => {
        e.preventDefault();
        if (saving || !user) return;
        setFormError('');
        const now = Date.now();
        const { errors: found, data } = validatePost({ ...form, slots: Number(form.slots), duration: Number(form.duration) }, now);
        if (data.game && data.game !== OTHER_GAME) {
            data.gameName = (universes || []).find(u => u.id === data.game)?.name || data.gameName || data.game;
        }
        setErrors(found);
        if (Object.keys(found).length) return;

        const mine = [...(ownPosts || []), ...loadedOwnPosts.filter(p => !(ownPosts || []).some(o => o.id === p.id))];
        if (mine.filter(p => now - createdMillis(p) < DAY).length >= LIMITS.postsPerDay) {
            setFormError(t('lfg.errors.dailyLimit', { count: LIMITS.postsPerDay }));
            return;
        }
        if (mine.some(p => !p.closed && !isExpired(p, now) && sameGame(p, data))) {
            setFormError(t('lfg.errors.activeExists'));
            return;
        }

        setSaving(true);
        try {
            const id = await createPost(user, profile, data);
            const cover = (universes || []).find(u => u.id === data.game)?.cover || null;
            postActivity(user, profile, {
                type: 'lfg',
                gameName: data.gameName,
                text: t('lfg.activityText', { slots: data.slots, mode: t(`lfg.mode.${data.mode}`), platform: t(`lfg.platform.${data.platform}`) }),
                url: `/lfg?post=${id}`,
                image: cover && cover.length < 500 ? cover : null,
            });
            setCreatedId(id);
            onCreated?.(id);
        } catch (error) {
            console.error('LFG create failed:', error);
            setFormError(t('lfg.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    if (createdId) {
        return (
            <div className="space-y-4 text-center">
                <BsCheckCircleFill className="mx-auto w-10 h-10 text-emerald-400" aria-hidden="true" />
                <div>
                    <p className="text-white font-semibold">{t('lfg.create.successTitle')}</p>
                    <p className="text-sm text-[#a1a6b3] mt-1">{t('lfg.create.successText')}</p>
                </div>
                <div className="text-left"><EnablePushPrompt compact /></div>
                <button type="button" onClick={onClose} className="gh-btn gh-btn-primary w-full">{t('lfg.create.viewPost')}</button>
            </div>
        );
    }

    const err = key => (errors[key] ? <span className="block text-xs text-red-300 mt-1">{t(errors[key], { max: LIMITS.slotsMax })}</span> : null);

    return (
        <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label={t('lfg.fields.game')}>
                <select value={form.game} onChange={set('game')} className={inputClass} required>
                    <option value="">{t('lfg.fields.chooseGame')}</option>
                    {(universes || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    <option value={OTHER_GAME}>{t('lfg.fields.otherGame')}</option>
                </select>
                {err('game')}
            </Field>
            {form.game === OTHER_GAME && (
                <Field label={t('lfg.fields.gameName')}>
                    <input value={form.gameName} onChange={set('gameName')} maxLength={LIMITS.gameName} className={inputClass} placeholder={t('lfg.fields.gameNamePlaceholder')} />
                    {err('gameName')}
                </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
                <Field label={t('lfg.fields.platform')}>
                    <select value={form.platform} onChange={set('platform')} className={inputClass}>
                        {PLATFORMS.map(p => <option key={p} value={p}>{t(`lfg.platform.${p}`)}</option>)}
                    </select>
                </Field>
                <Field label={t('lfg.fields.mode')}>
                    <select value={form.mode} onChange={set('mode')} className={inputClass}>
                        {MODES.map(m => <option key={m} value={m}>{t(`lfg.mode.${m}`)}</option>)}
                    </select>
                </Field>
                <Field label={t('lfg.fields.slots')}>
                    <select value={form.slots} onChange={set('slots')} className={inputClass}>
                        {Array.from({ length: LIMITS.slotsMax }, (_, i) => i + 1).map(n => <option key={n} value={n}>{t('lfg.fields.slotsOption', { count: n })}</option>)}
                    </select>
                    {err('slots')}
                </Field>
                <Field label={t('lfg.fields.rank')}>
                    <input value={form.rank} onChange={set('rank')} maxLength={LIMITS.rank} className={inputClass} placeholder={t('lfg.fields.rankPlaceholder')} />
                </Field>
                <Field label={t('lfg.fields.language')}>
                    <select value={form.language} onChange={set('language')} className={inputClass}>
                        {LANGUAGE_CODES.map(c => <option key={c} value={c}>{c === 'any' ? t('lfg.fields.anyLanguage') : languageName(c, locale)}</option>)}
                    </select>
                </Field>
                <Field label={t('lfg.fields.region')}>
                    <select value={form.region} onChange={set('region')} className={inputClass}>
                        {REGIONS.map(r => <option key={r} value={r}>{t(`lfg.region.${r}`)}</option>)}
                    </select>
                </Field>
                <Field label={t('lfg.fields.ageGroup')}>
                    <select value={form.ageGroup} onChange={set('ageGroup')} className={inputClass}>
                        {AGE_GROUPS.map(a => <option key={a} value={a}>{t(`lfg.age.${ageKey(a)}`)}</option>)}
                    </select>
                </Field>
                <Field label={t('lfg.fields.duration')}>
                    <select value={form.duration} onChange={set('duration')} className={inputClass}>
                        {DURATIONS.map(h => <option key={h} value={h}>{t('lfg.fields.hours', { count: h })}</option>)}
                    </select>
                </Field>
            </div>

            <Field label={t('lfg.fields.when')}>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t('lfg.fields.when')}>
                    {['now', 'tonight', 'custom'].map(option => (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={form.when === option}
                            onClick={() => set('when')(option)}
                            className={`h-10 rounded-lg text-sm font-medium border transition-colors ${form.when === option ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#c4b5fd]' : 'bg-[#0a0b0f] border-white/[0.1] text-[#c9ccd4]'}`}
                        >
                            {t(`lfg.when.${option}`)}
                        </button>
                    ))}
                </div>
            </Field>
            {form.when === 'custom' && (
                <Field label={t('lfg.fields.whenAt')}>
                    <input type="datetime-local" value={form.whenAt} min={localInputValue(new Date())} onChange={set('whenAt')} className={`${inputClass} [color-scheme:dark]`} />
                    {err('whenAt')}
                </Field>
            )}

            <label className="flex items-center gap-2.5 text-sm text-[#c9ccd4] cursor-pointer select-none">
                <input type="checkbox" checked={form.mic} onChange={set('mic')} className="w-4 h-4 accent-[#8b5cf6]" />
                <BsMic aria-hidden="true" className="text-[#a1a6b3]" />
                {t('lfg.fields.mic')}
            </label>

            <Field label={t('lfg.fields.note')} hint={t('lfg.fields.charsLeft', { count: LIMITS.note - form.note.length })}>
                <textarea value={form.note} onChange={set('note')} maxLength={LIMITS.note} rows={3} className={`${inputClass} !h-auto py-2 resize-none`} placeholder={t('lfg.fields.notePlaceholder')} />
            </Field>

            <SafetyNote />
            <FormError>{formError}</FormError>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
                <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary">{t('lfg.actions.cancel')}</button>
                <button type="submit" disabled={saving} className="gh-btn gh-btn-primary disabled:opacity-60">
                    {saving ? t('lfg.actions.saving') : t('lfg.create.submit')}
                </button>
            </div>
        </form>
    );
}

export default function CreatePostModal({ open, onClose, ...props }) {
    const { t } = useT();
    return (
        <Modal open={open} onClose={onClose} title={t('lfg.create.title')} subtitle={t('lfg.create.subtitle')}>
            <RequireLogin message={t('lfg.loginToPost')}>
                <CreateForm {...props} onClose={onClose} />
            </RequireLogin>
        </Modal>
    );
}
