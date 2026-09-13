import React, { useMemo, useRef, useState } from 'react';
import SectionHeader from '../Components/SectionHeader.jsx';
import StoreCard, { SOURCE_LABELS } from './StoreCard.jsx';
import { useHub, useHubProviders } from './hubApi.js';
import useStoreItem from './useStoreItem.jsx';

const WIDTHS = {
    landscape: 'w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23.5%] xl:w-[19%]',
    portrait: 'w-[42%] sm:w-[30%] md:w-[22%] lg:w-[15.5%] xl:w-[13%]',
};

function TabContent({ tab, onItemClick, scrollerRef }) {
    const { data, error } = useHub(tab.path, tab.select);
    const variant = tab.variant || 'landscape';

    if (error) {
        return <p className="text-sm text-[#6b7080] py-8 text-center gh-surface">This list is not available right now.</p>;
    }

    const items = data?.slice(0, tab.limit || 30);

    return (
        <div ref={scrollerRef} className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 custom-scrollbar" data-lenis-prevent>
            {!items
                ? Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className={`${WIDTHS[variant]} shrink-0 gh-surface overflow-hidden`}>
                        <div className={`${variant === 'portrait' ? 'aspect-[3/4]' : 'aspect-[460/215]'} bg-[#171a22] animate-pulse`} />
                        <div className="h-12" />
                    </div>
                ))
                : items.map(item => (
                    <StoreCard key={`${item.source}-${item.id}`} item={item} variant={variant} onClick={onItemClick} className={`${WIDTHS[variant]} shrink-0 snap-start`} />
                ))}
            {items?.length === 0 && <p className="text-sm text-[#6b7080] py-8">Nothing here right now.</p>}
        </div>
    );
}

/**
 * Horizontally scrolling row of hub items with optional source tabs.
 * tabs: [{ id, label, path, select (module-level fn), variant?, provider? }]
 * Tabs with a `provider` only show when the backend has that API key.
 */
export default function HubRow({ title, subtitle, tabs }) {
    const providers = useHubProviders();
    const visibleTabs = useMemo(() => tabs.filter(t => !t.provider || providers?.[t.provider]), [tabs, providers]);
    const [activeId, setActiveId] = useState(null);
    const [onItemClick, modal] = useStoreItem();
    const scrollerRef = useRef(null);

    const active = visibleTabs.find(t => t.id === activeId) || visibleTabs[0];
    if (!active) return null;

    const scroll = dir => scrollerRef.current?.scrollBy({ left: dir * scrollerRef.current.clientWidth * 0.9, behavior: 'smooth' });

    return (
        <section className="w-full mb-12">
            <SectionHeader
                title={title}
                subtitle={subtitle || (active.source && `Live from ${SOURCE_LABELS[active.source] || active.source}`)}
                onPrev={() => scroll(-1)}
                onNext={() => scroll(1)}
            />
            {visibleTabs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mt-1" role="tablist">
                    {visibleTabs.map(t => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={t.id === active.id}
                            onClick={() => setActiveId(t.id)}
                            className={`shrink-0 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors ${t.id === active.id ? 'bg-[#eceef2] text-[#0a0b0f] border-transparent' : 'bg-[#111319] text-[#a1a6b3] border-white/[0.06] hover:text-white hover:border-white/[0.14]'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
            <TabContent key={active.id} tab={active} onItemClick={onItemClick} scrollerRef={scrollerRef} />
            {modal}
        </section>
    );
}
