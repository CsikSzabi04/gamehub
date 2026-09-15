import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeader, { SectionLoader } from '../Components/SectionHeader.jsx';
import HubImage from './HubImage.jsx';
import { useApi } from '../Components/apiCache.js';
import { hubUrl } from './hubApi.js';
import { useT } from '../i18n/index.jsx';

const toList = data => (Array.isArray(data) ? data : []);

export function UniverseCard({ universe, className = '' }) {
    const { t } = useT();
    return (
        <Link to={`/hub/${universe.id}`} className={`game-card group block ${className}`}>
            <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#171a22]">
                <HubImage src={universe.cover} alt={universe.name} className="w-full h-full" />
                <p className="absolute inset-x-0 bottom-0 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-black/75 text-[13px] sm:text-[15px] font-semibold text-white truncate">{universe.name}</p>
            </div>
            <p className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#6b7080] truncate">{t('hub.universe.dataSource', { source: universe.source })}</p>
        </Link>
    );
}

/** Home page teaser for the per-game hub pages. */
export default function UniverseStrip() {
    const { t } = useT();
    const { data, error } = useApi(hubUrl('/universes'), toList);

    if (error) return null;
    if (!data) return <section className="mb-12"><SectionLoader title={t('hub.universe.title')} height="h-[180px]" /></section>;

    return (
        <section className="w-full mb-12">
            <SectionHeader
                title={t('hub.universe.title')}
                subtitle={t('hub.universe.stripSubtitle')}
                action={<Link to="/hub" className="gh-btn gh-btn-secondary !h-9">{t('common.viewAll')}</Link>}
            />
            <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x pb-2 custom-scrollbar" data-lenis-prevent>
                {data.map(u => (
                    <UniverseCard key={u.id} universe={u} className="w-[62%] sm:w-[36%] md:w-[26%] lg:w-[19%] xl:w-[15.5%] shrink-0 snap-start" />
                ))}
            </div>
        </section>
    );
}
