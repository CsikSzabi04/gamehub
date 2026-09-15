/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBell, BsBellFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { useReminders } from './useReminders.js';

/**
 * Bell toggle for a release reminder.
 * @param {{
 *   entry: { gameKey, name, image, releaseDate, releaseText?, url, platforms? },
 *   variant?: 'button' | 'icon',
 *   className?: string,
 *   withPrompt?: boolean,    // after setting: confirmation text + <EnablePushPrompt compact />
 *   onChange?: (isSet: boolean) => void,
 * }} props
 */
export default function ReminderToggle({ entry, variant = 'button', className = '', withPrompt = false, onChange }) {
    const { t } = useT();
    const navigate = useNavigate();
    const { user, byKey, add, remove } = useReminders();
    const [busy, setBusy] = useState(false);
    const [justSet, setJustSet] = useState(false);
    const [error, setError] = useState('');

    const isSet = Boolean(entry?.gameKey && byKey[entry.gameKey]);

    async function toggle(event) {
        event?.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        setBusy(true);
        setError('');
        try {
            if (isSet) {
                await remove(entry.gameKey);
                setJustSet(false);
            } else {
                await add(entry);
                setJustSet(true);
            }
            onChange?.(!isSet);
        } catch (err) {
            console.error('reminder:', err);
            setError(t('calendar.reminder.error'));
        } finally {
            setBusy(false);
        }
    }

    const label = isSet ? t('calendar.reminder.set') : t('calendar.reminder.add');

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={toggle}
                disabled={busy}
                aria-pressed={isSet}
                aria-label={label}
                title={error || label}
                className={`shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${isSet ? 'bg-[#8b5cf6]/15 border-[#8b5cf6]/40 text-[#c4b5fd]' : 'bg-white/[0.04] border-white/[0.08] text-[#a1a6b3] hover:text-white hover:bg-white/[0.08]'} ${className}`}
            >
                {isSet ? <BsBellFill className="w-4 h-4" /> : <BsBell className="w-4 h-4" />}
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={toggle}
                disabled={busy}
                aria-pressed={isSet}
                className={`gh-btn gh-btn-secondary ${isSet ? '!border-[#8b5cf6]/40 !text-[#c4b5fd]' : ''} ${className}`}
            >
                {isSet ? <BsBellFill /> : <BsBell />}
                {label}
            </button>
            {withPrompt && (error || justSet) && (
                <div className="basis-full w-full space-y-2">
                    {error
                        ? <p className="text-sm text-red-400">{error}</p>
                        : <p className="text-sm text-[#c4b5fd]">{entry.releaseDate ? t('calendar.reminder.confirm') : t('calendar.reminder.confirmTba')}</p>}
                    {justSet && <EnablePushPrompt compact />}
                </div>
            )}
        </>
    );
}
