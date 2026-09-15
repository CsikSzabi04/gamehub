/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useT } from '../i18n/index.jsx';

/** Splits a duration into { days, hours, minutes, seconds }. */
function splitDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
}

/** Current time, re-rendered every second while under an hour is left, otherwise every 30 s. */
function useNow(target) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const left = target - Date.now();
        if (!Number.isFinite(left) || left <= 0) return undefined;
        const id = setTimeout(() => setNow(Date.now()), left < 3600000 ? 1000 : 30000);
        return () => clearTimeout(id);
    }, [target, now]);
    return now;
}

/**
 * Live countdown: "2d 4h 12m" / "12m 30s".
 * @param {{ to: string|number|Date, className?: string, endedText?: string }} props
 */
export default function Countdown({ to, className = '', endedText }) {
    const { t } = useT();
    const target = new Date(to).getTime();
    const now = useNow(target);
    if (!Number.isFinite(target)) return null;

    const left = target - now;
    if (left <= 0) return <span className={className}>{endedText ?? t('calendar.countdown.ended')}</span>;

    const { days, hours, minutes, seconds } = splitDuration(left);
    const parts = days > 0
        ? [t('calendar.countdown.d', { n: days }), t('calendar.countdown.h', { n: hours }), t('calendar.countdown.m', { n: minutes })]
        : hours > 0
            ? [t('calendar.countdown.h', { n: hours }), t('calendar.countdown.m', { n: minutes })]
            : [t('calendar.countdown.m', { n: minutes }), t('calendar.countdown.s', { n: seconds })];

    return (
        <span className={`tabular-nums ${className}`} title={new Date(target).toLocaleString()}>
            {parts.join(' ')}
        </span>
    );
}
