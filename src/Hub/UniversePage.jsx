import React, { lazy, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BsArrowLeft, BsBoxArrowUpRight, BsSearch, BsX } from 'react-icons/bs';
import Header from '../Header.jsx';
import LazySection from '../Components/LazySection.jsx';
import HubImage from './HubImage.jsx';
import { useHub, timeAgo } from './hubApi.js';
import { useT } from '../i18n/index.jsx';

const Footer = lazy(() => import('../Footer.jsx'));

const PAGE_SIZE = 48;

function ItemDetails({ item, onClose }) {
    const { t } = useT();
    useEffect(() => {
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/75 flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-label={item.name}
                className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#111319] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl"
                onClick={e => e.stopPropagation()}
                data-lenis-prevent
            >
                <div className="relative bg-[#0a0b0f]">
                    <HubImage src={item.image} alt={item.name} fit="contain" width={800} className="w-full max-h-[50vh] aspect-square p-4" />
                    <button onClick={onClose} aria-label={t('common.close')} className="gh-icon-btn absolute top-3 right-3">
                        <BsX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.subtitle && <span className="gh-chip">{item.subtitle}</span>}
                        {item.tag && <span className="gh-chip" style={item.tagColor ? { color: item.tagColor } : undefined}>{item.tag}</span>}
                    </div>
                    {item.description && <p className="text-sm leading-relaxed text-[#a1a6b3] mt-4 whitespace-pre-line">{item.description}</p>}
                    {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="gh-btn gh-btn-secondary mt-5">
                            {t('hub.universe.openSource')} <BsBoxArrowUpRight className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function UniversePage() {
    const { t, locale } = useT();
    const { id } = useParams();
    const { data, error } = useHub(`/universe/${encodeURIComponent(id)}`);
    const [sectionId, setSectionId] = useState(null);
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(PAGE_SIZE);
    const [selected, setSelected] = useState(null);

    const section = data?.sections?.find(s => s.id === sectionId) || data?.sections?.[0];

    const items = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = section?.items || [];
        return q ? list.filter(i => `${i.name} ${i.subtitle || ''} ${i.tag || ''}`.toLowerCase().includes(q)) : list;
    }, [section, query]);

    useEffect(() => {
        setLimit(PAGE_SIZE);
    }, [sectionId, query, id]);

    useEffect(() => {
        if (data?.name) document.title = `${data.name} · Game Data Hub`;
        return () => { document.title = 'Game Data Hub'; };
    }, [data?.name]);

    function openItem(item) {
        if (item.description || !item.url) setSelected(item);
        else window.open(item.url, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="allSections">
                <Link to="/hub" className="inline-flex items-center gap-2 text-sm text-[#a1a6b3] hover:text-white mb-6">
                    <BsArrowLeft /> Game Hub
                </Link>

                {error && !data ? (
                    <div className="gh-surface p-8 text-center">
                        <p className="text-white font-semibold">{t('hub.universe.loadError')}</p>
                        <p className="text-sm text-[#6b7080] mt-1">{t('hub.universe.loadErrorHint')}</p>
                        <Link to="/hub" className="gh-btn gh-btn-secondary mt-5">{t('hub.universe.backToHub')}</Link>
                    </div>
                ) : !data ? (
                    <div className="space-y-4">
                        <div className="h-28 rounded-2xl bg-[#111319] animate-pulse" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-square rounded-xl bg-[#111319] animate-pulse" />)}
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="gh-surface overflow-hidden flex flex-col sm:flex-row mb-6">
                            <HubImage src={data.cover} alt={data.name} className="w-full sm:w-72 aspect-[16/9] sm:aspect-auto sm:min-h-[140px] shrink-0" />
                            <div className="p-5 sm:p-6 min-w-0 flex flex-col justify-center">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{data.name}</h1>
                                <p className="text-sm text-[#6b7080] mt-2">
                                    {t('hub.universe.dataFrom')}{' '}
                                    <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#c4b5fd] hover:text-white">{data.source}</a>
                                    {' '}{t('hub.universe.refreshed', { time: timeAgo(data.updatedAt, locale) || t('hub.universe.recently') })}
                                </p>
                            </div>
                        </header>

                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
                            <div className="flex gap-2 overflow-x-auto pb-1 flex-1" role="tablist">
                                {data.sections.map(s => (
                                    <button
                                        key={s.id}
                                        role="tab"
                                        aria-selected={s.id === section?.id}
                                        onClick={() => setSectionId(s.id)}
                                        className={`shrink-0 h-9 px-3 rounded-lg text-[13px] font-medium border transition-colors ${s.id === section?.id ? 'bg-[#eceef2] text-[#0a0b0f] border-transparent' : 'bg-[#111319] text-[#a1a6b3] border-white/[0.06] hover:text-white'}`}
                                    >
                                        {s.title} <span className="opacity-60">{s.items.length}</span>
                                    </button>
                                ))}
                            </div>
                            <label className="relative md:w-64 shrink-0">
                                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080] text-sm" />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={t('hub.universe.searchPlaceholder', { section: section?.title?.toLowerCase() || '' })}
                                    aria-label={t('hub.universe.searchLabel')}
                                    className="gh-input !pl-9 !py-2"
                                />
                            </label>
                        </div>

                        {items.length === 0 ? (
                            <p className="text-sm text-[#6b7080] py-10 text-center">{t('hub.universe.noResults')}</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {items.slice(0, limit).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => openItem(item)}
                                        className="game-card group text-left"
                                    >
                                        <div className="aspect-square bg-[#0e1016] overflow-hidden">
                                            <HubImage src={item.image} alt={item.name} fit="contain" className="w-full h-full p-2 group-hover:scale-[1.04] transition-transform duration-300" />
                                        </div>
                                        <div className="px-3 py-2.5">
                                            <p className="text-sm font-semibold text-[#eceef2] truncate">{item.name}</p>
                                            <p className="text-xs text-[#6b7080] truncate mt-0.5" style={item.tagColor ? { color: item.tagColor } : undefined}>
                                                {[item.subtitle, item.tag].filter(Boolean).join(' · ') || ' '}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {items.length > limit && (
                            <div className="flex justify-center mt-6">
                                <button onClick={() => setLimit(l => l + PAGE_SIZE)} className="gh-btn gh-btn-secondary">
                                    {t('hub.universe.showMoreLeft', { count: items.length - limit })}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
            <LazySection placeholder={false}><Footer /></LazySection>

            <AnimatePresence>
                {selected && <ItemDetails item={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
}
