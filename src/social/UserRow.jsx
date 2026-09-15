import { Link } from 'react-router-dom';
import { profileHref } from './profiles.js';
import ProfileAvatar from './ProfileAvatar.jsx';
import TierBadge from './TierBadge.jsx';
import FollowButton from './FollowButton.jsx';

/** Avatar + name + tier + optional follow button, links to the public profile. */
export default function UserRow({ profile, meta, follow = true, onNavigate }) {
    return (
        <div className="flex items-center gap-3 py-2.5">
            <Link to={profileHref(profile.username)} onClick={onNavigate} className="flex items-center gap-3 min-w-0 flex-1 group">
                <ProfileAvatar profile={profile} className="w-10 h-10 text-sm" />
                <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate group-hover:text-[#c4b5fd] transition-colors">{profile.username}</span>
                    <span className="flex items-center gap-2 mt-0.5 min-w-0">
                        <TierBadge profile={profile} />
                        {meta && <span className="text-xs text-[#6b7080] truncate">{meta}</span>}
                    </span>
                </span>
            </Link>
            {follow && <FollowButton targetUid={profile.uid} targetUsername={profile.username} size="sm" />}
        </div>
    );
}
