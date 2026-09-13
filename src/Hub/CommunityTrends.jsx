import React from 'react';
import HubRow from './HubRow.jsx';
import { pickItems } from './hubApi.js';

const TABS = [
    { id: 'twitch', label: 'Most watched on Twitch', path: '/twitch/top-games', select: pickItems, source: 'twitch', provider: 'twitch', variant: 'portrait' },
    { id: 'opencritic', label: 'Reviewed this week', path: '/opencritic/week', select: pickItems, source: 'opencritic', provider: 'opencritic' },
    { id: 'retro', label: 'Retro games getting achievements', path: '/retro/claims', select: pickItems, source: 'retroachievements', provider: 'retroachievements', variant: 'portrait' },
];

/** Renders nothing until at least one of these providers has an API key on the backend. */
export default function CommunityTrends() {
    return <HubRow title="What the community is into" tabs={TABS} />;
}
