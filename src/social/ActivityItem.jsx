import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
    BsActivity, BsArrowUpCircleFill, BsAwardFill, BsController, BsCpuFill, BsListOl,
    BsPencilSquare, BsPeopleFill, BsPersonPlusFill, BsTrophyFill,
} from 'react-icons/bs';
import { gameHref, parseGameKey } from '../lib/games.js';
import { useT } from '../i18n/index.jsx';
import { profileHref, relativeTime } from './profiles.js';
import ProfileAvatar from './ProfileAvatar.jsx';

const TYPES = {
    review: { icon: BsPencilSquare, color: '#a78bfa' },
    completed: { icon: BsTrophyFill, color: '#fb923c' },
    playing: { icon: BsController, color: '#34d399' },
    levelUp: { icon: BsArrowUpCircleFill, color: '#38bdf8' },
    lfg: { icon: BsPeopleFill, color: '#f472b6' },
    follow: { icon: BsPersonPlusFill, color: '#818cf8' },
    build: { icon: BsCpuFill, color: '#22d3ee' },
    tierlist: { icon: BsListOl, color: '#facc15' },
    challenge: { icon: BsAwardFill, color: '#f59e0b' },
};

const linkClass = 'font-semibold text-white hover:text-[#c4b5fd] transition-colors break-words';

/** Replaces {user}, {game}, {target}, {text} in a template with React nodes. */
function fillTemplate(template, parts) {
    return String(template).split(/(\{\w+\})/g).map((piece, i) => {
        const match = /^\{(\w+)\}$/.exec(piece);
        return <Fragment key={i}>{match && parts[match[1]] !== undefined ? parts[match[1]] : piece}</Fragment>;
    });
}

const isInternal = url => typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
const isHttp = url => typeof url === 'string' && /^https:\/\//i.test(url);

function SmartLink({ href, className, children }) {
    if (isInternal(href)) return <Link to={href} className={className}>{children}</Link>;
    if (isHttp(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
    return <span className={className}>{children}</span>;
}

/**
 * One entry of the public activity feed.
 *   <ActivityItem item={activityDoc} profile={usersDocOrUndefined} compact />
 */
export default function ActivityItem({ item, profile, compact = false }) {
    const { t, locale } = useT();
    const type = TYPES[item.type] || { icon: BsActivity, color: '#a1a6b3' };
    const Icon = type.icon;
    const username = item.username || profile?.username || t('social.feed.someone');

    const gameLink = item.gameKey && parseGameKey(item.gameKey) ? gameHref(item.gameKey) : item.url;
    const targetUrl = item.type === 'follow' && item.text ? profileHref(item.text) : item.url;

    let textPart = item.text;
    if (item.type === 'challenge' && item.text) {
        const key = `challenges.items.${item.text}.title`;
        const title = t(key);
        textPart = title === key ? item.text : title;
    }

    const parts = {
        user: <Link to={profileHref(username)} className={linkClass}>{username}</Link>,
        game: item.gameName ? <SmartLink href={gameLink} className={linkClass}>{item.gameName}</SmartLink> : t('social.feed.aGame'),
        target: item.text ? <Link to={targetUrl} className={linkClass}>{item.text}</Link> : t('social.feed.aPlayer'),
        text: textPart ? <SmartLink href={item.url} className={linkClass}>{textPart}</SmartLink> : '',
    };

    const templateKey = `social.activity.${item.type}`;
    const template = t(templateKey) === templateKey ? t('social.activity.generic') : t(templateKey);
    const showQuote = item.text && ['review', 'lfg', 'build', 'tierlist', 'completed', 'playing'].includes(item.type)
        && !template.includes('{text}');
    const safeImage = isHttp(item.image) ? item.image : null;

    return (
        <div className={`flex gap-3 ${compact ? 'py-3' : 'p-3 sm:p-4 rounded-xl bg-[#111319] border border-white/[0.06]'}`}>
            <div className="relative shrink-0">
                <Link to={profileHref(username)} aria-label={username}>
                    <ProfileAvatar profile={profile || { username }} className="w-10 h-10 text-sm" />
                </Link>
                <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#111319]"
                    style={{ background: type.color }}
                    aria-hidden="true"
                >
                    <Icon className="w-2.5 h-2.5 text-[#0a0b0f]" />
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm text-[#c9ccd4] leading-snug">{fillTemplate(template, parts)}</p>
                {showQuote && (
                    <p className="text-sm text-[#a1a6b3] mt-1 line-clamp-2 break-words">
                        <SmartLink href={item.gameKey ? null : item.url} className="hover:text-white">“{item.text}”</SmartLink>
                    </p>
                )}
                <p className="text-xs text-[#6b7080] mt-1">{relativeTime(item.createdAt, locale) || t('social.feed.justNow')}</p>
            </div>
            {safeImage && !compact && (
                <SmartLink href={gameLink} className="shrink-0 hidden min-[400px]:block">
                    <img src={safeImage} alt="" loading="lazy" className="w-20 h-11 sm:w-24 sm:h-[45px] rounded-md object-cover bg-[#171a22]" />
                </SmartLink>
            )}
        </div>
    );
}
