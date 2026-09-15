// "Patch notes" section of /status: latest Steam update posts for the user's library (or popular games).
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsBoxArrowUpRight, BsJournalText } from 'react-icons/bs';
import { EmptyState, Spinner, Tabs } from '../community/ui.jsx';
import { useApi } from '../Components/apiCache.js';
import { steamHeader } from '../lib/games.js';
import { useT } from '../i18n/index.jsx';
import { POPULAR_APPIDS, librarySteamGames, patchNotesUrl, toPatchItems } from './statusApi.js';

const PAGE = 8;

function PatchItem({ item, fallbackName }) {
    const { t, locale } = useT();
    const date = item.date ? new Date(item.date) : null;
    return (
        <article className="flex gap-3 rounded-xl bg-[#111319] border border-white/[0.06] p-3">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-24 sm:w-32 aspect-[460/215] rounded-lg overflow-hidden bg-[#171a22]">
                <img src={steamHeader(item.appid)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </a>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-[#6b7080]">
                    <span className={`rounded px-1.5 py-0.5 font-semibold ${item.isPatch ? 'bg-[#8b5cf6]/15 text-[#c4b5fd]' : 'bg-white/[0.06] text-[#a1a6b3]'}`}>
                        {item.isPatch ? t('status.patch.patchTag') : t('status.patch.newsTag')}
                    </span>
                    <span className="truncate">{item.gameName || fallbackName || `#${item.appid}`}</span>
                    {date && !Number.isNaN(date.getTime()) && <span className="shrink-0">· {date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</span>}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-[#eceef2] line-clamp-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">{item.title}</a>
                </h3>
                {item.excerpt && <p className="mt-1 text-xs text-[#a1a6b3] line-clamp-2 break-words">{item.excerpt}</p>}
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#c4b5fd] hover:text-white">
                    {t('status.patch.read')} <BsBoxArrowUpRight className="w-2.5 h-2.5" aria-hidden="true" />
                </a>
            </div>
        </article>
    );
}

function PatchList({ games }) {
    const { t } = useT();
    const [limit, setLimit] = useState(PAGE);
    const { data: items, error, loading } = useApi(games.length ? patchNotesUrl(games.map(g => g.appid)) : null, toPatchItems);
    const names = Object.fromEntries(games.map(g => [g.appid, g.name]));

    if (loading) return <Spinner className="py-10" />;
    if (error && !items) return <EmptyState icon={BsJournalText} title={t('status.patch.error')} />;
    if (!items?.length) return <EmptyState icon={BsJournalText} title={t('status.patch.empty')} text={t('status.patch.emptyText')} />;

    return (
        <>
            <div className="grid gap-2.5 md:grid-cols-2">
                {items.slice(0, limit).map(item => (
                    <PatchItem key={`${item.appid}-${item.url}`} item={item} fallbackName={names[item.appid]} />
                ))}
            </div>
            {items.length > limit && (
                <div className="mt-4 flex justify-center">
                    <button onClick={() => setLimit(n => n + PAGE)} className="gh-btn gh-btn-secondary">{t('status.patch.showMore')}</button>
                </div>
            )}
        </>
    );
}

const POPULAR = POPULAR_APPIDS.map(appid => ({ appid, name: null }));

export default function PatchNotes({ user }) {
    const { t } = useT();
    const uid = user?.uid || null;
    const [library, setLibrary] = useState({ uid: null, games: [] });
    const [mode, setMode] = useState('mine');

    useEffect(() => {
        if (!uid) return undefined;
        let active = true;
        librarySteamGames(uid)
            .then(games => active && setLibrary({ uid, games }))
            .catch(error => {
                console.error('Could not load library for patch notes:', error);
                if (active) setLibrary({ uid, games: [] });
            });
        return () => { active = false; };
    }, [uid]);

    const mine = uid && library.uid === uid ? library.games : [];
    const hasMine = mine.length > 0;
    const showMine = hasMine && mode === 'mine';
    const games = showMine ? mine : POPULAR;

    return (
        <section className="mt-12">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h2 className="gh-section-title">{t('status.patch.title')}</h2>
                    <p className="mt-1 text-sm text-[#a1a6b3]">{hasMine ? t('status.patch.subtitle') : t('status.patch.subtitleGuest')}</p>
                </div>
                {hasMine ? (
                    <Tabs
                        tabs={[{ id: 'mine', label: t('status.patch.mine') }, { id: 'popular', label: t('status.patch.popular') }]}
                        value={mode}
                        onChange={setMode}
                    />
                ) : (
                    <Link to="/library" className="gh-btn gh-btn-secondary self-start sm:self-auto">{t('status.patch.importLibrary')}</Link>
                )}
            </div>
            <PatchList key={games.map(g => g.appid).join(',')} games={games} />
        </section>
    );
}
