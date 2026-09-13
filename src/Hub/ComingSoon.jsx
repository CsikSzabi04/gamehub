import React from 'react';
import HubRow from './HubRow.jsx';
import { pickComingSoon, pickItems } from './hubApi.js';

const TABS = [
    { id: 'steam', label: 'Coming to Steam', path: '/steam/featured', select: pickComingSoon, source: 'steam' },
    { id: 'anticipated', label: 'Most anticipated', path: '/igdb/upcoming', select: pickItems, source: 'igdb', provider: 'igdb', variant: 'portrait' },
    { id: 'top-new', label: 'Best new releases', path: '/igdb/top-new', select: pickItems, source: 'igdb', provider: 'igdb', variant: 'portrait' },
];

export default function ComingSoon() {
    return <HubRow title="Coming soon" tabs={TABS} />;
}
