/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BsArrowLeft, BsBarChartSteps, BsGrid3X3Gap } from 'react-icons/bs';
import { EmptyState, PageShell, Tabs } from '../community/ui.jsx';
import HubImage from '../Hub/HubImage.jsx';
import { useHub } from '../Hub/hubApi.js';
import { useT } from '../i18n/index.jsx';
import CommunityBoard from '../tierlists/CommunityBoard.jsx';
import TierEditor from '../tierlists/TierEditor.jsx';
import { useTierVotes } from '../tierlists/useTierVotes.js';
import { eligibleSections, tierDocId } from '../tierlists/tierUtils.js';

const toList = data => (Array.isArray(data) ? data : []);

function UniversePicker() {
    const { t } = useT();
    const { data, error } = useHub('/universes', toList);

    return (
        <PageShell eyebrow={t('tierlists.eyebrow')} title={t('tierlists.title')} subtitle={t('tierlists.subtitle')} wide>
            {error && !data ? (
                <EmptyState icon={BsGrid3X3Gap} title={t('tierlists.universesError')} text={t('tierlists.universesErrorText')} />
            ) : !data ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-[#111319] animate-pulse" />)}
                </div>
            ) : (
                <>
                    <p className="text-sm text-[#a1a6b3] mb-4">{t('tierlists.pickGame')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {data.map(u => (
                            <Link key={u.id} to={`/tierlist/${encodeURIComponent(u.id)}`} className="game-card group block">
                                <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#171a22]">
                                    <HubImage src={u.cover} alt={u.name} className="w-full h-full" />
                                    <p className="absolute inset-x-0 bottom-0 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-black/75 text-[13px] sm:text-[15px] font-semibold text-white truncate">{u.name}</p>
                                </div>
                                <p className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#6b7080] truncate">{t('tierlists.makeTierList')}</p>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </PageShell>
    );
}

function UniverseTierList({ id }) {
    const { t } = useT();
    const { data, error } = useHub(`/universe/${encodeURIComponent(id)}`);
    const [searchParams, setSearchParams] = useSearchParams();
    const [mode, setMode] = useState('community');

    const sections = useMemo(() => eligibleSections(data?.sections), [data]);
    const requested = searchParams.get('section');
    const section = sections.find(s => s.id === requested) || sections[0] || null;
    const docId = section ? tierDocId(id, section.id) : null;
    const { votes, error: votesError, setVote, reload } = useTierVotes(docId);

    useEffect(() => {
        if (section && requested !== section.id) setSearchParams({ section: section.id }, { replace: true });
    }, [section, requested, setSearchParams]);

    const back = (
        <Link to="/tierlist" className="gh-btn gh-btn-secondary !h-9">
            <BsArrowLeft className="w-4 h-4" /> {t('tierlists.allGames')}
        </Link>
    );

    if (error && !data) {
        return (
            <PageShell eyebrow={t('tierlists.eyebrow')} title={t('tierlists.title')}>
                <EmptyState icon={BsBarChartSteps} title={t('tierlists.universeError')} text={t('tierlists.universeErrorText')} action={back} />
            </PageShell>
        );
    }

    if (!data) {
        return (
            <PageShell eyebrow={t('tierlists.eyebrow')} title={t('tierlists.title')}>
                <div className="space-y-2">
                    <div className="h-10 w-72 max-w-full rounded-lg bg-[#111319] animate-pulse" />
                    {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 sm:h-20 rounded-xl bg-[#111319] animate-pulse" />)}
                </div>
            </PageShell>
        );
    }

    const universe = { id, name: data.name, cover: data.cover };

    return (
        <PageShell eyebrow={t('tierlists.eyebrow')} title={t('tierlists.universeTitle', { name: data.name })} subtitle={t('tierlists.universeSubtitle')} actions={back}>
            {!section ? (
                <EmptyState icon={BsBarChartSteps} title={t('tierlists.noSections')} text={t('tierlists.noSectionsText')} action={back} />
            ) : (
                <>
                    {sections.length > 1 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('tierlists.section')}</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
                                {sections.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={s.id === section.id}
                                        onClick={() => setSearchParams({ section: s.id }, { replace: true })}
                                        className={`shrink-0 h-9 px-3 rounded-lg text-[13px] font-medium border transition-colors ${s.id === section.id ? 'bg-[#eceef2] text-[#0a0b0f] border-transparent' : 'bg-[#111319] text-[#a1a6b3] border-white/[0.06] hover:text-white'}`}
                                    >
                                        {s.title} <span className="opacity-60">{s.items.length}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Tabs
                        className="mb-5"
                        value={mode}
                        onChange={setMode}
                        tabs={[
                            { id: 'community', label: t('tierlists.communityTab'), count: votes ? Object.keys(votes).length : null },
                            { id: 'mine', label: t('tierlists.mineTab') },
                        ]}
                    />

                    {mode === 'community' ? (
                        <CommunityBoard
                            key={docId}
                            items={section.items}
                            votes={votes}
                            error={votesError}
                            onReload={reload}
                            onStartRanking={() => setMode('mine')}
                            title={`${data.name} · ${section.title}`}
                            subtitle={t('tierlists.communityTab')}
                            fileName={`tierlist-${docId}-community.png`}
                        />
                    ) : (
                        <TierEditor key={docId} docId={docId} items={section.items} universe={universe} section={section} onSaved={setVote} />
                    )}
                </>
            )}
        </PageShell>
    );
}

export default function TierListPage() {
    const { id } = useParams();
    return id ? <UniverseTierList key={id} id={id} /> : <UniversePicker />;
}
