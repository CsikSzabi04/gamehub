import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonCheckFill, BsPersonPlus } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { useFollow } from './useFollow.js';

/**
 * Follow / unfollow toggle. Hidden for your own uid. Signed-out users are sent to /login.
 *   <FollowButton targetUid={uid} targetUsername="Alex" size="sm" />
 */
export default function FollowButton({ targetUid, targetUsername, size = 'md', className = '' }) {
    const { user } = useContext(UserContext) || {};
    const navigate = useNavigate();
    const { t } = useT();
    const { following, loading, busy, toggle } = useFollow(targetUid, targetUsername);

    if (!targetUid || user?.uid === targetUid) return null;

    const onClick = event => {
        event.preventDefault();
        event.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        toggle();
    };

    const sizing = size === 'sm' ? '!h-8 !px-3 !text-xs' : '';
    const Icon = following ? BsPersonCheckFill : BsPersonPlus;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={busy || loading}
            aria-pressed={following}
            className={`group gh-btn ${following ? 'gh-btn-secondary' : 'gh-btn-primary'} ${sizing} ${className}`}
        >
            <Icon aria-hidden="true" />
            {following ? (
                <>
                    <span className="group-hover:hidden">{t('social.follow.following')}</span>
                    <span className="hidden group-hover:inline">{t('social.follow.unfollow')}</span>
                </>
            ) : (
                <span>{t('social.follow.follow')}</span>
            )}
        </button>
    );
}
