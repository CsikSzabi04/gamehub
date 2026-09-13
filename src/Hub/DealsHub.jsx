import React from 'react';
import HubRow from './HubRow.jsx';
import { pickSpecials, pickGogDeals, pickItems } from './hubApi.js';

const TABS = [
    { id: 'steam', label: 'Steam', path: '/steam/featured', select: pickSpecials, source: 'steam' },
    { id: 'gog', label: 'GOG', path: '/gog', select: pickGogDeals, source: 'gog' },
    { id: 'itad', label: 'All stores', path: '/itad/deals', select: pickItems, source: 'itad', provider: 'itad' },
];

export default function DealsHub() {
    return <HubRow title="Best deals right now" tabs={TABS} />;
}
