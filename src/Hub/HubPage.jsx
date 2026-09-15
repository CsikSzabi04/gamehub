import { lazy, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header.jsx';
import LazySection from '../Components/LazySection.jsx';
import SectionHeader from '../Components/SectionHeader.jsx';
import { useApi } from '../Components/apiCache.js';
import HubRow from './HubRow.jsx';
import { useT } from '../i18n/index.jsx';
import { UniverseCard } from './UniverseStrip.jsx';
import { hubUrl, pickItems, pickTopSellers, pickNewReleases, pickGogTrending, pickGogNewest } from './hubApi.js';
import { CatalogueSection, FreeGamesSection, NewsSection } from './DiscoverSections.jsx';

const LivePlayers = lazy(() => import('./LivePlayers.jsx'));
const DealsHub = lazy(() => import('./DealsHub.jsx'));
const ComingSoon = lazy(() => import('./ComingSoon.jsx'));
const CommunityTrends = lazy(() => import('./CommunityTrends.jsx'));
const SpeedrunFeed = lazy(() => import('./SpeedrunFeed.jsx'));
const Footer = lazy(() => import('../Footer.jsx'));

const toList = data => (Array.isArray(data) ? data : []);

const STORE_TABS = [
    { id: 'top', labelKey: 'hub.tabs.topSellers', path: '/steam/featured', select: pickTopSellers, source: 'steam' },
    { id: 'new', labelKey: 'hub.tabs.newOnSteam', path: '/steam/featured', select: pickNewReleases, source: 'steam' },
    { id: 'spy', labelKey: 'hub.tabs.hotTwoWeeks', path: '/steamspy/trending', select: pickItems, source: 'steam' },
    { id: 'gog', labelKey: 'hub.tabs.trendingGog', path: '/gog', select: pickGogTrending, source: 'gog' },
    { id: 'gog-new', labelKey: 'hub.tabs.newOnGog', path: '/gog', select: pickGogNewest, source: 'gog' },
];

export default function HubPage() {
    const { t } = useT();
    const { hash } = useLocation();
    const { data: universes, error } = useApi(hubUrl('/universes'), toList);

    // /discover redirects to /hub#discover (and the jump links use anchors)
    useEffect(() => {
        if (!hash) return undefined;
        const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
        return () => clearTimeout(timer);
    }, [hash]);

    const jumpLinks = [
        { id: 'store-charts', label: t('hub.page.storeCharts') },
        { id: 'universes', label: t('hub.universe.title') },
        { id: 'discover', label: t('discover.title') },
        { id: 'all-games', label: t('discover.allGames') },
        { id: 'free-to-play', label: t('discover.allFreeGames') },
    ];

    return (
        <div className="min-h-screen">
            <Header />
            <main className="allSections">
                <div className="mb-8">
                    <p className="gh-eyebrow mb-2">Game Hub</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{t('hub.page.title')}</h1>
                    <p className="text-[#a1a6b3] mt-3 max-w-2xl">
                        {t('hub.page.intro')} {t('discover.intro')}
                    </p>
                    <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Game Hub">
                        {jumpLinks.map(link => (
                            <a key={link.id} href={`#${link.id}`} className="gh-chip shrink-0 hover:!bg-white/[0.1] hover:text-white">
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div id="store-charts" className="scroll-mt-24">
                    <HubRow title={t('hub.page.storeCharts')} tabs={STORE_TABS} />
                </div>

                <section id="universes" className="w-full mb-12 scroll-mt-24">
                    <SectionHeader title={t('hub.universe.title')} subtitle={universes ? t('hub.page.universesCount', { count: universes.length }) : undefined} />
                    {error ? (
                        <p className="text-sm text-[#6b7080]">{t('hub.page.universesUnavailable')}</p>
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

                {/* ---------- Discover (the former /discover page) ---------- */}
                <div id="discover" className="scroll-mt-24 mt-4 mb-8 pt-8 border-t border-white/[0.06]">
                    <p className="gh-eyebrow mb-2">{t('discover.title')}</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{t('discover.intro')}</h2>
                </div>
                <CatalogueSection />
                <LazySection><NewsSection /></LazySection>
                <FreeGamesSection />

                <LazySection><CommunityTrends /></LazySection>
                <LazySection><SpeedrunFeed /></LazySection>
            </main>
            <LazySection placeholder={false}><Footer /></LazySection>
        </div>
    );
}
