// Notification preferences: users/{uid}.notificationPrefs = { [type]: boolean, push: boolean }
// A missing value means ON. Types match the backend (lib/push.js).
import { useContext } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { firestore } from '../lib/firebase.js';

export const NOTIFICATION_TYPES = ['priceAlerts', 'freeGames', 'releases', 'social', 'lfg', 'reviews', 'challenges', 'status'];

export const isPrefOn = (profile, type) => (profile?.notificationPrefs || {})[type] !== false;

/** Saves one preference and updates the in-memory profile. */
export async function setNotificationPref(user, setProfile, type, enabled) {
    if (!user?.uid) return;
    const { db, doc, setDoc } = await firestore();
    await setDoc(doc(db, 'users', user.uid), { notificationPrefs: { [type]: Boolean(enabled) } }, { merge: true });
    setProfile?.(prev => ({ ...(prev || {}), notificationPrefs: { ...(prev?.notificationPrefs || {}), [type]: Boolean(enabled) } }));
}

/** [enabled, setEnabled] for one notification type of the signed-in user. */
export function useNotificationPref(type) {
    const { user, profile, setProfile } = useContext(UserContext) || {};
    return [isPrefOn(profile, type), enabled => setNotificationPref(user, setProfile, type, enabled)];
}
