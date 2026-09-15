import { BsLightningChargeFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { levelInfoOf } from './profiles.js';

/** Translated tier name (falls back to the English name from profileUtils). */
// eslint-disable-next-line react-refresh/only-export-components
export function tierName(t, tier) {
    if (!tier?.name) return '';
    const key = `social.tiers.${tier.name}`;
    const value = t(key);
    return value === key ? tier.name : value;
}

/** "Lv 7 · Veteran" pill in the tier color. Pass a users/{uid} doc. */
export default function TierBadge({ profile, className = '' }) {
    const { t } = useT();
    const info = levelInfoOf(profile);
    const color = info.tier?.color || '#9ca3af';
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${className}`}
            style={{ color, background: `${color}1f`, border: `1px solid ${color}40` }}
        >
            <BsLightningChargeFill aria-hidden="true" className="w-3 h-3" />
            {t('social.levelShort', { level: info.level })} · {tierName(t, info.tier)}
        </span>
    );
}
