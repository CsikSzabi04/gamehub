import { Link } from 'react-router-dom';
import {
    BsBell, BsCalendarEvent, BsExclamationTriangle, BsGift, BsHandThumbsUp, BsPeople, BsPersonPlus, BsTag, BsTrash3, BsTrophy,
} from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { toDate } from '../lib/firebase.js';

export const TYPE_ICONS = {
    priceAlerts: BsTag,
    freeGames: BsGift,
    releases: BsCalendarEvent,
    social: BsPersonPlus,
    lfg: BsPeople,
    reviews: BsHandThumbsUp,
    challenges: BsTrophy,
    status: BsExclamationTriangle,
    system: BsBell,
};

const TYPE_COLORS = {
    priceAlerts: 'text-emerald-400 bg-emerald-500/10',
    freeGames: 'text-pink-400 bg-pink-500/10',
    releases: 'text-sky-400 bg-sky-500/10',
    social: 'text-[#c4b5fd] bg-[#8b5cf6]/10',
    lfg: 'text-amber-400 bg-amber-500/10',
    reviews: 'text-emerald-400 bg-emerald-500/10',
    challenges: 'text-yellow-400 bg-yellow-500/10',
    status: 'text-red-400 bg-red-500/10',
    system: 'text-[#c9ccd4] bg-white/[0.06]',
};

export function useRelativeTime() {
    const { locale } = useT();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return value => {
        const date = toDate(value);
        if (!date) return '';
        const seconds = Math.round((date.getTime() - Date.now()) / 1000);
        const abs = Math.abs(seconds);
        if (abs < 60) return rtf.format(seconds, 'second');
        if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
        if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
        if (abs < 604800) return rtf.format(Math.round(seconds / 86400), 'day');
        return date.toLocaleDateString(locale);
    };
}

export default function NotificationItem({ item, onOpen, onRemove, compact = false }) {
    const { t } = useT();
    const relative = useRelativeTime();
    const Icon = TYPE_ICONS[item.type] || BsBell;
    const internal = typeof item.url === 'string' && item.url.startsWith('/');

    const body = (
        <>
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[item.type] || TYPE_COLORS.system}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block text-sm ${item.read ? 'text-[#c9ccd4]' : 'text-white font-semibold'} ${compact ? 'line-clamp-2' : ''}`}>{item.title}</span>
                {item.body && <span className={`block text-xs text-[#8a8f9c] mt-0.5 ${compact ? 'line-clamp-2' : ''}`}>{item.body}</span>}
                <span className="block text-[11px] text-[#6b7080] mt-1">{relative(item.createdAt)}</span>
            </span>
            {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8b5cf6]" aria-label={t('notifications.unread')} />}
        </>
    );

    const className = `flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-colors hover:bg-white/[0.04] ${item.read ? '' : 'bg-white/[0.02]'}`;

    return (
        <div className="group relative">
            {internal ? (
                <Link to={item.url} onClick={() => onOpen?.(item)} className={className}>{body}</Link>
            ) : (
                <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => onOpen?.(item)} className={className}>{body}</a>
            )}
            {onRemove && (
                <button
                    onClick={() => onRemove(item.id)}
                    aria-label={t('notifications.remove')}
                    className="absolute right-2 bottom-2 p-1.5 rounded-md text-[#6b7080] hover:text-red-400 hover:bg-red-500/10 sm:opacity-0 group-hover:opacity-100 transition"
                >
                    <BsTrash3 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
