import { BsStarFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';

/** Read-only star row. */
export function Stars({ value, className = 'text-sm' }) {
    const { t } = useT();
    const rounded = Math.round(Number(value) || 0);
    return (
        <div className={`flex gap-0.5 ${className}`} role="img" aria-label={t('reviewsPlus.outOfFive', { value: Number(value) || 0 })}>
            {[1, 2, 3, 4, 5].map(star => (
                <BsStarFill key={star} aria-hidden="true" className={star <= rounded ? 'text-amber-400' : 'text-[#2a2e38]'} />
            ))}
        </div>
    );
}

/** Clickable star row. size: 'lg' (main rating) | 'sm' (aspects). */
export function StarInput({ value, onChange, size = 'lg', label }) {
    const { t } = useT();
    const buttonClass = size === 'lg'
        ? 'p-1.5 sm:p-1 text-2xl sm:text-xl'
        : 'p-1 text-lg sm:text-base';
    return (
        <div className="flex" role="group" aria-label={label}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    aria-label={t('reviewsPlus.starLabel', { count: star })}
                    aria-pressed={value === star}
                    onClick={() => onChange(star)}
                    className={`${buttonClass} leading-none transition-colors ${value >= star ? 'text-amber-400' : 'text-[#2a2e38] hover:text-amber-300/70'}`}
                >
                    <BsStarFill aria-hidden="true" />
                </button>
            ))}
        </div>
    );
}
