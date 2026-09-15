import React, { useEffect, useMemo, useState } from 'react';
import GameCard from '../Components/GameCard.jsx';
import SectionHeader from '../Components/SectionHeader.jsx';
import StoreCard, { SOURCE_LABELS } from '../Hub/StoreCard.jsx';
import useStoreItem from '../Hub/useStoreItem.jsx';
import { useHub, timeAgo, pickItems } from '../Hub/hubApi.js';
import { useT } from '../i18n/index.jsx';

// Fresh store charts first; the RAWG catalogue stays as the last tab
const TABS = [
    { id: 'top', label: 'home.featured.tabs.top', path: '/steam/featured', key: 'topSellers', source: 'steam' },
    { id: 'new', label: 'home.featured.tabs.new', path: '/steam/featured', key: 'newReleases', source: 'steam' },
    { id: 'hot', label: 'home.featured.tabs.hot', path: '/steamspy/trending', key: 'items', source: 'steam' },
    { id: 'gog', label: 'home.featured.tabs.gog', path: '/gog', key: 'trending', source: 'gog' },
    { id: 'picks', label: 'home.featured.tabs.picks' },
];

// Two full rows at every breakpoint: 2 / 3 / 4 / 5 columns
function visibleCount() {
    if (window.innerWidth < 768) return 4;
    if (window.innerWidth < 1024) return 6;
    if (window.innerWidth < 1280) return 8;
    return 10;
}

function Skeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={`gh-surface overflow-hidden ${i >= 8 ? 'hidden xl:block' : i >= 6 ? 'hidden lg:block' : i >= 4 ? 'hidden md:block' : ''}`}>
                    <div className="aspect-[16/10] bg-[#171a22] animate-pulse" />
                    <div className="p-3.5 space-y-2">
                        <div className="h-3.5 w-3/4 rounded bg-[#171a22]" />
                        <div className="h-3 w-1/3 rounded bg-[#171a22]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FeaturedGames({ allGames, showGameDetails }) {
    const { t, locale } = useT();
    const [tabId, setTabId] = useState('top');
    const [count, setCount] = useState(visibleCount);
    const [onItemClick, modal] = useStoreItem();
    const tab = TABS.find(item => item.id === tabId);

    // One request per endpoint; the Steam tabs share /steam/featured
    const { data: storeData, error } = useHub(tab.path || null);

    useEffect(() => {
        const onResize = () => setCount(visibleCount());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const picks = useMemo(
        () => (Array.isArray(allGames) ? [...allGames].sort(() => 0.5 - Math.random()).slice(0, 10) : []),
        [allGames]
    );

    const storeItems = tab.key ? (tab.key === 'items' ? pickItems(storeData) : storeData?.[tab.key] || []) : [];
    const failed = tab.path && error && !storeData;

    let subtitle = t('home.featured.subtitlePicks');
    if (tab.path) {
        subtitle = storeData?.updatedAt
            ? t('home.featured.liveFromUpdated', { source: SOURCE_LABELS[tab.source], time: timeAgo(storeData.updatedAt, locale) })
            : t('home.featured.liveFrom', { source: SOURCE_LABELS[tab.source] });
    }

    return (
        <div className="w-full mb-12">
            <SectionHeader title={t('home.featured.title')} subtitle={subtitle} />

            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mt-1" role="tablist" aria-label={t('home.featured.tabsLabel')}>
                {TABS.map(item => (
                    <button
                        key={item.id}
                        role="tab"
                        aria-selected={item.id === tabId}
                        onClick={() => setTabId(item.id)}
                        className={`shrink-0 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors ${item.id === tabId ? 'bg-[#eceef2] text-[#0a0b0f] border-transparent' : 'bg-[#111319] text-[#a1a6b3] border-white/[0.06] hover:text-white hover:border-white/[0.14]'}`}
                    >
                        {t(item.label)}
                    </button>
                ))}
            </div>

            {tab.id === 'picks' ? (
                picks.length === 0 ? <Skeleton /> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                        {picks.slice(0, count).map(game => (
                            <GameCard key={game.id} game={game} onClick={showGameDetails} />
                        ))}
                    </div>
                )
            ) : failed ? (
                <div className="gh-surface p-6 text-center">
                    <p className="text-sm text-[#a1a6b3]">{t('home.featured.unavailable')}</p>
                    <button onClick={() => setTabId('picks')} className="gh-btn gh-btn-secondary mt-4">{t('home.featured.showPicks')}</button>
                </div>
            ) : !storeData ? (
                <Skeleton />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {storeItems.slice(0, count).map(item => (
                        <StoreCard key={`${item.source}-${item.id}`} item={item} onClick={onItemClick} />
                    ))}
                </div>
            )}
            {modal}
        </div>
    );
}
