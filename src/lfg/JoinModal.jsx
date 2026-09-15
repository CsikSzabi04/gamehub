/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { Field, Modal, RequireLogin, inputClass } from '../community/ui.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { LIMITS, clip, isOpen, rememberContact, rememberedContact } from './constants.js';
import { sendRequest } from './lfgApi.js';
import { FormError, PostBadges, SafetyNote } from './parts.jsx';

function JoinForm({ post, onClose, onSent }) {
    const { t } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState(rememberedContact);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const submit = async e => {
        e.preventDefault();
        if (!user || saving) return;
        if (post.uid === user.uid) return;
        if (!isOpen(post, Date.now())) {
            setError(t('lfg.errors.notOpen'));
            return;
        }
        if (clip(contact, LIMITS.contact).length < 2) {
            setError(t('lfg.errors.contact'));
            return;
        }
        setSaving(true);
        setError('');
        try {
            await sendRequest(user, profile, post.id, { message, contact });
            rememberContact(contact);
            setSent(true);
            onSent?.(post.id);
        } catch (err) {
            console.error('LFG request failed:', err);
            setError(t('lfg.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    if (sent) {
        return (
            <div className="space-y-4 text-center">
                <BsCheckCircleFill className="mx-auto w-10 h-10 text-emerald-400" aria-hidden="true" />
                <div>
                    <p className="text-white font-semibold">{t('lfg.join.sentTitle')}</p>
                    <p className="text-sm text-[#a1a6b3] mt-1">{t('lfg.join.sentText')}</p>
                </div>
                <div className="text-left"><EnablePushPrompt compact /></div>
                <button type="button" onClick={onClose} className="gh-btn gh-btn-primary w-full">{t('lfg.actions.done')}</button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <PostBadges post={post} />
            <Field label={t('lfg.join.message')} hint={t('lfg.fields.charsLeft', { count: LIMITS.message - message.length })}>
                <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={LIMITS.message} rows={3} className={`${inputClass} !h-auto py-2 resize-none`} placeholder={t('lfg.join.messagePlaceholder')} />
            </Field>
            <Field label={t('lfg.join.contact')} hint={t('lfg.join.contactHint')}>
                <input value={contact} onChange={e => setContact(e.target.value)} maxLength={LIMITS.contact} className={inputClass} placeholder={t('lfg.join.contactPlaceholder')} autoComplete="off" />
            </Field>
            <SafetyNote />
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary">{t('lfg.actions.cancel')}</button>
                <button type="submit" disabled={saving} className="gh-btn gh-btn-primary disabled:opacity-60">{saving ? t('lfg.actions.saving') : t('lfg.join.submit')}</button>
            </div>
        </form>
    );
}

export default function JoinModal({ post, onClose, onSent }) {
    const { t } = useT();
    return (
        <Modal open={Boolean(post)} onClose={onClose} title={t('lfg.join.title')} subtitle={post ? t('lfg.join.subtitle', { game: post.gameName, username: post.username }) : undefined}>
            <RequireLogin message={t('lfg.loginToJoin')}>
                {post && <JoinForm post={post} onClose={onClose} onSent={onSent} />}
            </RequireLogin>
        </Modal>
    );
}
