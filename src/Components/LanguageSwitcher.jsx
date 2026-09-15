import React, { useContext } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { LANGUAGES, useT } from '../i18n/index.jsx';

const loadFirestore = () => Promise.all([import('firebase/firestore'), import('../../firebaseConfig.js')]);

/**
 * HU / EN / DE segmented switch. Changes the site language right away and,
 * for a signed-in user, saves it to users/{uid}.language so it follows them across devices.
 */
export default function LanguageSwitcher({ className = '', accent, onChange }) {
    const { lang, setLang, t } = useT();
    const { user, setProfile } = useContext(UserContext) || {};

    async function choose(code) {
        if (code === lang) return;
        setLang(code);
        if (!user) {
            onChange?.(code);
            return;
        }
        setProfile?.(prev => (prev ? { ...prev, language: code } : prev));
        try {
            const [{ doc, setDoc }, { firestore }] = await loadFirestore();
            await setDoc(doc(firestore, 'users', user.uid), { language: code }, { merge: true });
        } catch (error) {
            console.error('Error saving language:', error);
        }
        onChange?.(code);
    }

    return (
        <div role="radiogroup" aria-label={t('common.language')} className={`inline-flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 ${className}`}>
            {LANGUAGES.map(({ code, label, flag }) => {
                const active = code === lang;
                return (
                    <button
                        key={code}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => choose(code)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${active ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        style={active ? { background: accent || 'rgba(255,255,255,0.12)' } : undefined}
                    >
                        <span aria-hidden="true">{flag}</span>
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
