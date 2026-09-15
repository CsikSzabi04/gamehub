import { BsAwardFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { challengeById, monthRange } from './challenges.js';

/** A claimed challenge badge tile: { id, month, earnedAt } from users/{uid}.challengeBadges. */
export default function ChallengeBadge({ badge }) {
    const { t, locale } = useT();
    const def = challengeById(badge.id);
    const Icon = def?.icon || BsAwardFill;
    const color = def?.color || '#f59e0b';
    const titleKey = `challenges.items.${badge.id}.title`;
    const title = t(titleKey) === titleKey ? badge.id : t(titleKey);
    let monthLabel = badge.month;
    if (/^\d{4}-\d{2}$/.test(badge.month || '')) {
        monthLabel = monthRange(badge.month).start.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
    }

    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#171a22] p-3 min-w-0" title={title}>
            <span
                className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: `${color}22`, color, boxShadow: `0 0 18px ${color}26` }}
            >
                <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-white truncate">{title}</span>
                <span className="block text-xs text-[#6b7080] truncate">{monthLabel}</span>
            </span>
        </div>
    );
}
