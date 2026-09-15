/* eslint-disable react/prop-types */
// Achievement / trophy rows, shared by the Achievements page and the game page panel.
// item: { id, name, desc, icon, unlocked, at, rarity, hidden, type?, gs? }
import { useMemo, useState } from 'react';
import { BsLockFill } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { PSN_TROPHY_COLORS, rarityTier } from './gamerProgress.js';

export function RarityChip({ rarity }) {
    const { t, locale } = useT();
    const tier = rarityTier(rarity);
    if (!tier) return null;
    return (
        <span
            className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
            style={{ color: tier.color, borderColor: `${tier.color}55`, background: `${tier.color}14` }}
            title={t('achievements.rarityTitle', { percent: rarity.toLocaleString(locale) })}
        >
            {t(`achievements.rarity.${tier.key}`)} · {rarity.toLocaleString(locale, { maximumFractionDigits: 1 })}%
        </span>
    );
}

export function AchievementRow({ item, showState = true }) {
    const { t, locale } = useT();
    const locked = showState && !item.unlocked;
    const secret = locked && item.hidden;
    const date = item.at ? new Date(item.at) : null;
    return (
        <li className={`flex gap-3 py-2.5 min-w-0 ${locked ? 'opacity-70' : ''}`}>
            <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-white/[0.05]">
                {item.icon && <img src={item.icon} alt="" loading="lazy" className={`h-full w-full object-cover ${locked ? 'grayscale' : ''}`} />}
                {locked && <BsLockFill className="absolute bottom-0.5 right-0.5 h-3 w-3 text-white/80 drop-shadow" aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-white">
                    {item.type && <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PSN_TROPHY_COLORS[item.type] }} title={t(`achievements.trophy.${item.type}`)} />}
                    <span className="min-w-0 break-words">{secret ? t('achievements.hiddenName') : item.name}</span>
                    {item.gs > 0 && <span className="text-[11px] font-bold text-[#4ade80]">{item.gs}G</span>}
                </p>
                <p className="text-xs text-[#8a8f9c] mt-0.5 break-words">{secret ? t('achievements.hiddenDesc') : item.desc}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <RarityChip rarity={item.rarity} />
                    {showState && item.unlocked && (
                        <span className="text-[11px] text-[#34d399]">
                            {date ? t('achievements.unlockedOn', { date: date.toLocaleDateString(locale) }) : t('achievements.unlocked')}
                        </span>
                    )}
                </div>
            </div>
        </li>
    );
}

const FILTERS = ['all', 'unlocked', 'locked'];
const SORTS = ['default', 'rarest', 'common', 'recent'];

/** Filterable list. `showState` false = plain list without the user's progress (e.g. guests on a game page). */
export default function AchievementList({ items, showState = true, initial = 12 }) {
    const { t } = useT();
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('default');
    const [visible, setVisible] = useState(initial);

    const shown = useMemo(() => {
        let list = items;
        if (showState && filter !== 'all') list = list.filter(item => (filter === 'unlocked' ? item.unlocked : !item.unlocked));
        if (sort === 'rarest') list = [...list].sort((a, b) => (a.rarity ?? 101) - (b.rarity ?? 101));
        if (sort === 'common') list = [...list].sort((a, b) => (b.rarity ?? -1) - (a.rarity ?? -1));
        if (sort === 'recent') list = [...list].sort((a, b) => (b.at || '').localeCompare(a.at || ''));
        return list;
    }, [items, filter, sort, showState]);

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {showState && FILTERS.map(key => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => { setFilter(key); setVisible(initial); }}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${filter === key ? 'bg-white text-[#0a0b0f]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                    >
                        {t(`achievements.filter.${key}`)}
                    </button>
                ))}
                <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    aria-label={t('achievements.sortLabel')}
                    className="ml-auto h-8 rounded-lg bg-[#0a0b0f] border border-white/[0.1] px-2 text-xs text-white"
                >
                    {SORTS.filter(key => showState || key !== 'recent').map(key => <option key={key} value={key}>{t(`achievements.sort.${key}`)}</option>)}
                </select>
            </div>
            {shown.length === 0 ? (
                <p className="text-sm text-[#8a8f9c] py-3">{t('achievements.noneInFilter')}</p>
            ) : (
                <ul className="divide-y divide-white/[0.05]">
                    {shown.slice(0, visible).map(item => <AchievementRow key={item.id} item={item} showState={showState} />)}
                </ul>
            )}
            {shown.length > visible && (
                <button type="button" onClick={() => setVisible(v => v + 50)} className="gh-btn gh-btn-secondary w-full mt-2 !h-9">
                    {t('achievements.showMore', { count: shown.length - visible })}
                </button>
            )}
        </div>
    );
}
