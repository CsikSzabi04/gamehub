import React from 'react';
import HubRow from './HubRow.jsx';
import { useT } from '../i18n/index.jsx';
import { pickItems } from './hubApi.js';

const TABS = [
    { id: 'twitch', labelKey: 'hub.tabs.mostWatchedTwitch', path: '/twitch/top-games', select: pickItems, source: 'twitch', provider: 'twitch', variant: 'portrait' },
    { id: 'opencritic', labelKey: 'hub.tabs.reviewedThisWeek', path: '/opencritic/week', select: pickItems, source: 'opencritic', provider: 'opencritic' },
    { id: 'retro', labelKey: 'hub.tabs.retroAchievements', path: '/retro/claims', select: pickItems, source: 'retroachievements', provider: 'retroachievements', variant: 'portrait' },
];

/** Renders nothing until at least one of these providers has an API key on the backend. */
export default function CommunityTrends() {
    const { t } = useT();
    return <HubRow title={t('hub.community')} tabs={TABS} />;
}
