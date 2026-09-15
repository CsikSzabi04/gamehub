// "Game Pass" / "Leaving Game Pass soon" / "EA Play" / "Coming to Game Pass" pills on the game page.
/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { BsClockHistory, BsController, BsExclamationTriangleFill, BsLightningChargeFill } from 'react-icons/bs';
import { useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';
import { subscriptionCheckUrl, toMatches } from '../subscriptions/gamepass.js';

const PILL = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-semibold border transition-colors';

const STYLES = {
    gamepass: 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#86efac] hover:bg-[#22c55e]/20',
    leaving: 'bg-[#f59e0b]/10 border-[#f59e0b]/35 text-[#fcd34d] hover:bg-[#f59e0b]/20',
    eaplay: 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5] hover:bg-[#ef4444]/20',
    coming: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#c4b5fd] hover:bg-[#8b5cf6]/20',
};

export default function SubscriptionBadge({ game }) {
    const { t } = useT();
    const name = game?.name?.trim();
    const { data: lists, error } = useApi(name ? subscriptionCheckUrl(name) : null, toMatches);
    if (!name || error || !lists?.length) return null;

    const has = list => lists.includes(list);
    const onConsole = has('console');
    const onPc = has('pc');
    const pills = [];

    if (has('leaving')) {
        pills.push({ id: 'leaving', tab: 'leaving', icon: BsExclamationTriangleFill, label: t('subscriptions.badge.leaving') });
    } else if (onConsole || onPc) {
        const platform = onConsole && onPc ? '' : onPc ? t('subscriptions.badge.pcOnly') : t('subscriptions.badge.consoleOnly');
        pills.push({ id: 'gamepass', tab: onPc && !onConsole ? 'pc' : 'console', icon: BsController, label: t('subscriptions.badge.gamePass'), extra: platform });
    } else if (has('essential')) {
        pills.push({ id: 'gamepass', tab: 'essential', icon: BsController, label: t('subscriptions.badge.essential') });
    } else if (has('recent')) {
        pills.push({ id: 'gamepass', tab: 'recent', icon: BsController, label: t('subscriptions.badge.gamePass') });
    }
    if (has('coming') && !pills.length) {
        pills.push({ id: 'coming', tab: 'coming', icon: BsClockHistory, label: t('subscriptions.badge.coming') });
    }
    if (has('eaplay')) {
        pills.push({ id: 'eaplay', tab: 'eaplay', icon: BsLightningChargeFill, label: t('subscriptions.badge.eaplay') });
    }
    if (!pills.length) return null;

    return (
        <>
            {pills.map(pill => (
                <Link key={pill.id} to={`/subscriptions?tab=${pill.tab}`} className={`${PILL} ${pill.id === 'leaving' ? STYLES.leaving : STYLES[pill.id]}`}>
                    <pill.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {pill.label}
                    {pill.extra && <span className="opacity-70 font-medium">· {pill.extra}</span>}
                </Link>
            ))}
        </>
    );
}
