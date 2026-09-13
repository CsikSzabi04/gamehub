import React, { useContext, useState } from 'react';
import { UserContext } from '../../Features/UserContext.jsx';

/**
 * The signed-in user's uploaded profile picture (from the Firestore profile),
 * falling back to the first letter of their username / email.
 * Size and shape come from className; the image fills the box.
 */
export default function UserAvatar({ className = '' }) {
    const { user, profile } = useContext(UserContext) || {};
    const [failed, setFailed] = useState(false);
    const name = profile?.username || user?.email || '?';

    if (profile?.avatar && !failed) {
        return (
            <img
                src={profile.avatar}
                alt={name}
                decoding="async"
                onError={() => setFailed(true)}
                className={`rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <span className={`inline-flex items-center justify-center rounded-full ${className}`}>
            {name.trim()[0]?.toUpperCase() || '?'}
        </span>
    );
}
