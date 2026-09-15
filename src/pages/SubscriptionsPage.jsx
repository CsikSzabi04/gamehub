// /subscriptions – Xbox Game Pass / EA Play catalog finder + links to other subscription catalogs.
/* eslint-disable react/prop-types */
import { useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsArrowRepeat, BsBoxArrowUpRight, BsExclamationTriangleFill, BsSearch, BsSteam, BsXbox } from 'react-icons/bs';
import { EmptyState, PageShell, Spinner, Tabs, inputClass } from '../community/ui.jsx';
import { useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';
import { EXTERNAL_CATALOGS, GAMEPASS_LISTS, gamepassListUrl, searchKey, steamSearchUrl, toList } from '../subscriptions/gamepass.js';

const PAGE_SIZE = 48;

const toIdSet = raw => new Set((Array.isArray(raw?.items) ? raw.items : []).map(item => item.id));

function GameCard({ item, leaving, coming }) {
    const { t } = useT();
    return (
        <article className={`group flex flex-col overflow-hidden rounded-xl bg-[#111319] border ${leaving ? 'border-[#f59e0b]/40' : 'border-white/[0.06]'}`}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video bg-[#171a22] overflow-hidden">
                {item.image && (
                    <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                )}
                {(leaving || coming) && (
                    <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${leaving ? 'bg-[#f59e0b] text-[#1a1200]' : 'bg-[#8b5cf6] text-white'}`}>
                        {leaving && <BsExclamationTriangleFill className="w-3 h-3" aria-hidden="true" />}
                        {leaving ? t('subscriptions.leavingBadge') : t('subscriptions.comingBadge')}
                    </span>
                )}
            </a>
            <div className="flex flex-1 flex-col p-3">
                <h3 className="text-sm font-semibold text-[#eceef2] line-clamp-2 min-h-[2.5rem]" title={item.name}>{item.name}</h3>
                <div className="mt-2.5 flex gap-1.5">
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#22c55e]/10 text-[#86efac] text-xs font-semibold hover:bg-[#22c55e]/20"
                    >
                        <BsXbox className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('subscriptions.xboxStore')}
                    </a>
                    <a
                        href={steamSearchUrl(item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/[0.05] text-[#c9ccd4] text-xs font-semibold hover:bg-white/[0.09]"
                    >
                        <BsSteam className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('subscriptions.steamSearch')}
                    </a>
                </div>
            </div>
        </article>
    );
}

function CatalogList({ list, search, leavingIds, onRetry }) {
    const { t, locale } = useT();
    const { data, error, loading } = useApi(gamepassListUrl(list), toList);
    const [limit, setLimit] = useState(PAGE_SIZE);
    const deferred = useDeferredValue(search);

    const filtered = useMemo(() => {
        const items = data?.items || [];
        const needle = searchKey(deferred);
        return needle ? items.filter(item => searchKey(item.name).includes(needle)) : items;
    }, [data, deferred]);

    if (loading) return <Spinner />;
    if (error && !data) {
        return (
            <EmptyState
                icon={BsExclamationTriangleFill}
                title={t('subscriptions.loadError')}
                text={t('subscriptions.loadErrorText')}
                action={<button onClick={onRetry} className="gh-btn gh-btn-secondary"><BsArrowRepeat /> {t('subscriptions.retry')}</button>}
            />
        );
    }

    const updated = data?.updatedAt ? new Date(data.updatedAt) : null;
    return (
        <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b7080]">
                <span>{t('subscriptions.count', { count: filtered.length })}</span>
                {updated && !Number.isNaN(updated.getTime()) && (
                    <span>{t('subscriptions.updated', { date: updated.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) })}</span>
                )}
            </div>
            {filtered.length === 0 ? (
                <EmptyState icon={BsSearch} title={t('subscriptions.noResults')} text={t('subscriptions.noResultsText')} />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                        {filtered.slice(0, limit).map(item => (
                            <GameCard
                                key={item.id}
                                item={item}
                                leaving={list === 'leaving' || leavingIds.has(item.id)}
                                coming={list === 'coming'}
                            />
                        ))}
                    </div>
                    {filtered.length > limit && (
                        <div className="mt-6 flex justify-center">
                            <button onClick={() => setLimit(n => n + PAGE_SIZE)} className="gh-btn gh-btn-secondary">
                                {t('subscriptions.showMore')}
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default function SubscriptionsPage() {
    const { t } = useT();
    const [params, setParams] = useSearchParams();
    const requested = params.get('tab');
    const tab = GAMEPASS_LISTS.includes(requested) ? requested : 'recent';
    const [search, setSearch] = useState('');
    const [attempt, setAttempt] = useState(0);
    const { data: leavingIds } = useApi(gamepassListUrl('leaving'), toIdSet);

    const tabs = GAMEPASS_LISTS.map(id => ({ id, label: t(`subscriptions.tabs.${id}`) }));
    const changeTab = id => {
        setParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('tab', id);
            return next;
        }, { replace: true });
    };

    return (
        <PageShell eyebrow={t('subscriptions.eyebrow')} title={t('subscriptions.pageTitle')} subtitle={t('subscriptions.subtitle')}>
            <Tabs tabs={tabs} value={tab} onChange={changeTab} className="mb-4" />

            <div className="relative mb-4 max-w-md">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080] w-4 h-4" aria-hidden="true" />
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value.slice(0, 80))}
                    placeholder={t('subscriptions.searchPlaceholder')}
                    aria-label={t('subscriptions.searchPlaceholder')}
                    className={`${inputClass} pl-9`}
                />
            </div>

            {tab === 'leaving' && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.08] p-3 sm:p-4 text-sm text-[#fcd34d]">
                    <BsExclamationTriangleFill className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
                    <p>{t('subscriptions.leavingWarning')}</p>
                </div>
            )}

            <CatalogList
                key={`${tab}-${attempt}`}
                list={tab}
                search={search}
                leavingIds={leavingIds || new Set()}
                onRetry={() => setAttempt(n => n + 1)}
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2">
                <section className="gh-surface p-4 sm:p-5">
                    <h2 className="gh-section-title mb-2">{t('subscriptions.aboutTitle')}</h2>
                    <p className="text-sm text-[#a1a6b3]">{t('subscriptions.aboutText')}</p>
                </section>
                <section className="gh-surface p-4 sm:p-5">
                    <h2 className="gh-section-title mb-2">{t('subscriptions.otherTitle')}</h2>
                    <p className="text-sm text-[#a1a6b3] mb-3">{t('subscriptions.otherText')}</p>
                    <ul className="grid gap-1.5">
                        {EXTERNAL_CATALOGS.map(link => (
                            <li key={link.key}>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] px-3 h-10 text-sm text-[#eceef2]"
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: link.color }} aria-hidden="true" />
                                        <span className="truncate">{t(`subscriptions.links.${link.key}`)}</span>
                                    </span>
                                    <BsBoxArrowUpRight className="w-3 h-3 text-[#6b7080] shrink-0" aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </PageShell>
    );
}
