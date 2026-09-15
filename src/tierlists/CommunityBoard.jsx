/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { BsArrowClockwise, BsBarChartSteps, BsPeople, BsX } from 'react-icons/bs';
import { EmptyState, Spinner } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import TierTile, { TierLabel } from './TierTile.jsx';
import ShareImageButton from './ShareImageButton.jsx';
import { TIERS, TIER_COLORS, aggregateVotes } from './tierUtils.js';

/** Aggregated community ranking (average of all votes). */
export default function CommunityBoard({ items, votes, error, onReload, onStartRanking, title, subtitle, fileName }) {
    const { t, locale } = useT();
    const [selectedId, setSelectedId] = useState(null);
    const [showUnranked, setShowUnranked] = useState(false);

    const result = useMemo(() => aggregateVotes(Object.values(votes || {}), items), [votes, items]);
    const selected = useMemo(() => {
        if (!selectedId) return null;
        for (const tier of TIERS) {
            const hit = result.rows[tier].find(e => String(e.item.id) === selectedId);
            if (hit) return { ...hit, tier };
        }
        return null;
    }, [selectedId, result]);

    if (!votes && error) {
        return (
            <EmptyState
                icon={BsBarChartSteps}
                title={t('tierlists.votesError')}
                text={t('tierlists.votesErrorText')}
                action={<button type="button" onClick={onReload} className="gh-btn gh-btn-secondary"><BsArrowClockwise className="w-4 h-4" /> {t('tierlists.retry')}</button>}
            />
        );
    }
    if (!votes) return <Spinner />;

    if (result.voters === 0) {
        return (
            <EmptyState
                icon={BsBarChartSteps}
                title={t('tierlists.noVotes')}
                text={t('tierlists.noVotesText')}
                action={<button type="button" onClick={onStartRanking} className="gh-btn gh-btn-primary">{t('tierlists.rankIt')}</button>}
            />
        );
    }

    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm text-[#a1a6b3] inline-flex items-center gap-2">
                    <BsPeople className="w-4 h-4" /> {t('tierlists.voters', { count: result.voters })}
                </p>
                <ShareImageButton
                    fileName={fileName}
                    className="gh-btn gh-btn-secondary !h-9"
                    getData={() => ({
                        title,
                        subtitle: `${subtitle} · ${t('tierlists.communityImageTag', { count: result.voters })}`,
                        rows: Object.fromEntries(TIERS.map(tier => [tier, result.rows[tier].map(e => e.item)])),
                    })}
                />
            </div>
            <p className="text-xs text-[#6b7080] mb-3">{t('tierlists.communityHint')}</p>

            <div className="space-y-1.5">
                {TIERS.map(tier => (
                    <div key={tier} className="flex rounded-xl bg-[#111319] border border-white/[0.06] min-h-[64px] sm:min-h-[84px]">
                        <TierLabel tier={tier} />
                        <div className="flex flex-wrap gap-1.5 p-1.5 sm:p-2 flex-1 min-w-0 content-start">
                            {result.rows[tier].map(entry => {
                                const id = String(entry.item.id);
                                return (
                                    <TierTile
                                        key={id}
                                        item={entry.item}
                                        badge={entry.count}
                                        selected={selectedId === id}
                                        title={t('tierlists.tileTitle', { name: entry.item.name, count: entry.count, avg: number.format(entry.avg) })}
                                        onClick={() => setSelectedId(selectedId === id ? null : id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {result.unranked.length > 0 && (
                <div className="mt-5">
                    <button type="button" onClick={() => setShowUnranked(v => !v)} className="text-sm text-[#a1a6b3] hover:text-white">
                        {t(showUnranked ? 'tierlists.hideUnvoted' : 'tierlists.showUnvoted', { count: result.unranked.length })}
                    </button>
                    {showUnranked && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {result.unranked.map(item => <TierTile key={String(item.id)} item={item} />)}
                        </div>
                    )}
                </div>
            )}

            {selected && (
                <div className="fixed inset-x-0 bottom-0 z-[150] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[420px] sm:p-0">
                    <div className="rounded-2xl bg-[#171a22] border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-white truncate">{selected.item.name}</p>
                                <p className="text-xs text-[#a1a6b3] mt-0.5">
                                    {t('tierlists.selectedStats', { tier: selected.tier, avg: number.format(selected.avg), count: selected.count })}
                                </p>
                            </div>
                            <button type="button" onClick={() => setSelectedId(null)} aria-label={t('tierlists.close')} className="-mr-1 -mt-1 p-1.5 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]">
                                <BsX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-3 space-y-1">
                            {TIERS.map(tier => (
                                <div key={tier} className="flex items-center gap-2 text-xs">
                                    <span className="w-4 font-bold" style={{ color: TIER_COLORS[tier] }}>{tier}</span>
                                    <span className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                        <span className="block h-full rounded-full" style={{ width: `${(selected.dist[tier] / selected.count) * 100}%`, backgroundColor: TIER_COLORS[tier] }} />
                                    </span>
                                    <span className="w-6 text-right text-[#a1a6b3]">{selected.dist[tier]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
