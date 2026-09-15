import React from 'react';
import HubRow from './HubRow.jsx';
import { useT } from '../i18n/index.jsx';
import { pickSpecials, pickGogDeals, pickItems } from './hubApi.js';

const TABS = [
    { id: 'steam', label: 'Steam', path: '/steam/featured', select: pickSpecials, source: 'steam' },
    { id: 'gog', label: 'GOG', path: '/gog', select: pickGogDeals, source: 'gog' },
    { id: 'itad', labelKey: 'hub.tabs.allStores', path: '/itad/deals', select: pickItems, source: 'itad', provider: 'itad' },
];

export default function DealsHub() {
    const { t } = useT();
    return <HubRow title={t('hub.deals')} tabs={TABS} />;
}
