import React from 'react';
import HubRow from './HubRow.jsx';
import { useT } from '../i18n/index.jsx';
import { pickComingSoon, pickItems } from './hubApi.js';

const TABS = [
    { id: 'steam', labelKey: 'hub.tabs.comingToSteam', path: '/steam/featured', select: pickComingSoon, source: 'steam' },
    { id: 'anticipated', labelKey: 'hub.tabs.mostAnticipated', path: '/igdb/upcoming', select: pickItems, source: 'igdb', provider: 'igdb', variant: 'portrait' },
    { id: 'top-new', labelKey: 'hub.tabs.bestNewReleases', path: '/igdb/top-new', select: pickItems, source: 'igdb', provider: 'igdb', variant: 'portrait' },
];

export default function ComingSoon() {
    const { t } = useT();
    return <HubRow title={t('hub.comingSoon')} tabs={TABS} />;
}
