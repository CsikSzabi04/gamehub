import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { currentSubscription, disablePush, enablePush, notificationPermission, pushSupport } from './push.js';

/** Push state of this device for the signed-in user. */
export default function usePush() {
    const { user } = useContext(UserContext) || {};
    const [support] = useState(pushSupport);
    const [permission, setPermission] = useState(notificationPermission);
    const [subscribed, setSubscribed] = useState(null); // null = checking
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        currentSubscription()
            .then(sub => { if (active) setSubscribed(Boolean(sub) && notificationPermission() === 'granted'); })
            .catch(() => { if (active) setSubscribed(false); });
        return () => { active = false; };
    }, [user?.uid]);

    const enable = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            await enablePush(user);
            setSubscribed(true);
        } catch (err) {
            setError(err.code || 'failed');
            console.error('Enable push failed:', err);
        } finally {
            setPermission(notificationPermission());
            setBusy(false);
        }
    }, [user]);

    const disable = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            await disablePush(user);
            setSubscribed(false);
        } finally {
            setBusy(false);
        }
    }, [user]);

    return { user, support, permission, subscribed, busy, error, enable, disable };
}
