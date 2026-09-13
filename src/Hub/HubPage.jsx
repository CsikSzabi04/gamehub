import React, { lazy } from 'react';
import Header from '../Header.jsx';
import LazySection from '../Components/LazySection.jsx';
import SectionHeader from '../Components/SectionHeader.jsx';
import { useApi } from '../Components/apiCache.js';
import HubRow from './HubRow.jsx';
import { UniverseCard } from './UniverseStrip.jsx';
import { hubUrl, pickItems, pickTopSellers, pickNewReleases, pickGogTrending, pickGogNewest } from './hubApi.js';

const LivePlayers = lazy(() => import('./LivePlayers.jsx'));
const DealsHub = lazy(() => import('./DealsHub.jsx'));
const ComingSoon = lazy(() => import('./ComingSoon.jsx'));
const CommunityTrends = lazy(() => import('./CommunityTrends.jsx'));
const SpeedrunFeed = lazy(() => import('./SpeedrunFeed.jsx'));
const Footer = lazy(() => import('../Footer.jsx'));

const toList = data => (Array.isArray(data) ? data : []);

const STORE_TABS = [
    { id: 'top', label: 'Steam top sellers', path: '/steam/featured', select: pickTopSellers, source: 'steam' },
    { id: 'new', label: 'New on Steam', path: '/steam/featured', select: pickNewReleases, source: 'steam' },
    { id: 'spy', label: 'Hot last 2 weeks', path: '/steamspy/trending', select: pickItems, source: 'steam' },
    { id: 'gog', label: 'Trending on GOG', path: '/gog', select: pickGogTrending, source: 'gog' },
    { id: 'gog-new', label: 'New on GOG', path: '/gog', select: pickGogNewest, source: 'gog' },
];

export default function HubPage() {
    const { data: universes, error } = useApi(hubUrl('/universes'), toList);

    return (
        <div className="min-h-screen">
            <Header />
            <main className="allSections">
                <div className="mb-10">
                    <p className="gh-eyebrow mb-2">Game Hub</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Everything live, from every store and game</h1>
                    <p className="text-[#a1a6b3] mt-3 max-w-2xl">
                        Store charts, live player counts, deals and per-game data pulled from public game APIs and refreshed automatically.
                    </p>
                </div>

                <HubRow title="Store charts" tabs={STORE_TABS} />

                <section className="w-full mb-12">
                    <SectionHeader title="Game universes" subtitle={universes ? `${universes.length} games with their own live data` : undefined} />
                    {error ? (
                        <p className="text-sm text-[#6b7080]">Game universes are not available right now.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
                            {universes
                                ? universes.map(u => <UniverseCard key={u.id} universe={u} />)
                                : Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-[4/3.6] sm:aspect-[16/12] rounded-xl bg-[#111319] animate-pulse" />)}
                        </div>
                    )}
                </section>

                <LazySection><LivePlayers /></LazySection>
                <LazySection><DealsHub /></LazySection>
                <LazySection><ComingSoon /></LazySection>
                <LazySection><CommunityTrends /></LazySection>
                <LazySection><SpeedrunFeed /></LazySection>
            </main>
            <LazySection placeholder={false}><Footer /></LazySection>
        </div>
    );
}
