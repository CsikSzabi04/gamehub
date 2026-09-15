/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { useNotificationPref } from '../notifications/prefs.js';

/** On/off switch for one notification type (users/{uid}.notificationPrefs[type]). Hidden when signed out. */
export default function PrefSwitch({ type, label, hint }) {
    const { user } = useContext(UserContext) || {};
    const [enabled, setEnabled] = useNotificationPref(type);
    const [busy, setBusy] = useState(false);
    if (!user) return null;

    async function toggle() {
        setBusy(true);
        try {
            await setEnabled(!enabled);
        } catch (error) {
            console.error('notification pref:', error);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                {hint && <p className="text-xs text-[#a1a6b3] mt-0.5">{hint}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={label}
                onClick={toggle}
                disabled={busy}
                className={`relative shrink-0 h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${enabled ? 'bg-[#8b5cf6]' : 'bg-white/[0.12]'}`}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
        </div>
    );
}
