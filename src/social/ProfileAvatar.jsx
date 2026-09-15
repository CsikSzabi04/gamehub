import { useState } from 'react';
import { getAccent } from '../Components/profile/profileUtils.js';

/**
 * Avatar of any users/{uid} profile: uploaded picture or the first letter on the profile's accent gradient.
 *   <ProfileAvatar profile={p} className="w-10 h-10 text-base" ring />
 */
export default function ProfileAvatar({ profile, className = 'w-10 h-10 text-base', ring = false }) {
    const [failed, setFailed] = useState(false);
    const name = profile?.username || '?';
    const accent = getAccent(profile?.accent);
    const gradient = `linear-gradient(135deg, ${accent.from}, ${accent.to})`;

    const inner = profile?.avatar && !failed ? (
        <img
            src={profile.avatar}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="w-full h-full rounded-full object-cover"
        />
    ) : (
        <span className="w-full h-full rounded-full flex items-center justify-center font-bold text-white" style={{ background: gradient }}>
            {name.trim()[0]?.toUpperCase() || '?'}
        </span>
    );

    if (!ring) return <span className={`inline-flex shrink-0 rounded-full overflow-hidden bg-[#171a22] ${className}`}>{inner}</span>;
    return (
        <span className={`inline-flex shrink-0 rounded-full p-[3px] ${className}`} style={{ background: gradient }}>
            <span className="w-full h-full rounded-full overflow-hidden bg-[#0a0b0f] border-[3px] border-[#0a0b0f] flex">{inner}</span>
        </span>
    );
}
