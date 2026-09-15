/* eslint-disable react/prop-types */
// Manual "add to library" for platforms without a public API (Epic, EA, Rockstar, Riot):
// quick picks for the platform's own games + RAWG search.
import { useEffect, useState } from 'react';
import { BsCheck, BsPlus, BsSearch } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Modal, Spinner, inputClass } from '../community/ui.jsx';
import { LIBRARY_STATUSES } from './libraryApi.js';

const RAWG_KEY = '984255fceb114b05b5e746dc24a8520a';

/** Well-known games published on each launcher (searched by name on RAWG when picked). */
export const PLATFORM_PICKS = {
    riot: ['League of Legends', 'VALORANT', 'Teamfight Tactics', 'Legends of Runeterra', '2XKO'],
    rockstar: ['Grand Theft Auto V', 'Red Dead Redemption 2', 'Red Dead Redemption', 'Grand Theft Auto IV', 'Max Payne 3', 'L.A. Noire', 'Bully'],
    ea: ['EA SPORTS FC 25', 'Apex Legends', 'Battlefield 2042', 'The Sims 4', 'Star Wars Jedi: Survivor', 'Need for Speed Unbound'],
    epic: ['Fortnite', 'Rocket League', 'Fall Guys', 'Alan Wake 2', 'Genshin Impact', 'Hogwarts Legacy'],
};

async function searchRawg(query, signal) {
    const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=8`, { signal });
    if (!res.ok) throw new Error(`RAWG ${res.status}`);
    const data = await res.json();
    return (data.results || []).map(g => ({ id: g.id, name: g.name, image: g.background_image, released: g.released }));
}

export default function QuickAddGame({ platform, open, onClose, byKey, importItems }) {
    const { t } = useT();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('playing');
    const [addedKeys, setAddedKeys] = useState(() => new Set());

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults(null);
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            searchRawg(q, controller.signal)
                .then(setResults)
                .catch(error => { if (error.name !== 'AbortError') setResults([]); })
                .finally(() => setLoading(false));
        }, 350);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const add = async game => {
        const gameKey = `rawg-${game.id}`;
        await importItems([{ gameKey, name: game.name, image: game.image, source: 'rawg', sourceId: String(game.id), platform, status }]);
        setAddedKeys(current => new Set(current).add(gameKey));
    };

    const pick = async name => {
        setQuery(name);
    };

    const close = () => {
        setQuery('');
        setResults(null);
        setAddedKeys(new Set());
        onClose();
    };

    return (
        <Modal open={open} onClose={close} title={t(`profileExtras.platforms.${platform}`)} subtitle={t('profileExtras.quickAdd.subtitle')} maxWidth="max-w-xl">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080]" aria-hidden="true" />
                        <input value={query} onChange={e => setQuery(e.target.value.slice(0, 80))} placeholder={t('profileExtras.quickAdd.search')} className={`${inputClass} pl-9`} autoFocus />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} sm:w-44`} aria-label={t('profileExtras.import.statusLabel')}>
                        {LIBRARY_STATUSES.map(s => <option key={s} value={s}>{t(`library.status.${s}`)}</option>)}
                    </select>
                </div>

                {PLATFORM_PICKS[platform] && !results && (
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('profileExtras.quickAdd.popular')}</p>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORM_PICKS[platform].map(name => (
                                <button key={name} type="button" onClick={() => pick(name)} className="gh-chip hover:!bg-white/[0.1]">{name}</button>
                            ))}
                        </div>
                    </div>
                )}

                {loading && <Spinner className="py-6" />}

                {results && !loading && (results.length === 0 ? (
                    <p className="text-sm text-[#a1a6b3]">{t('profileExtras.quickAdd.none')}</p>
                ) : (
                    <ul className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.06] bg-[#0a0b0f]">
                        {results.map(game => {
                            const key = `rawg-${game.id}`;
                            const inLibrary = Boolean(byKey[key]) || addedKeys.has(key);
                            return (
                                <li key={game.id} className="flex items-center gap-3 px-3 py-2 min-w-0">
                                    {game.image ? <img src={game.image} alt="" loading="lazy" className="h-10 w-16 rounded object-cover shrink-0" /> : <span className="h-10 w-16 rounded bg-white/[0.06] shrink-0" />}
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm text-white">{game.name}</span>
                                        {game.released && <span className="block text-xs text-[#6b7080]">{game.released.slice(0, 4)}</span>}
                                    </span>
                                    <button type="button" disabled={inLibrary} onClick={() => add(game)} className="gh-btn gh-btn-secondary !h-8 !px-2.5 shrink-0" aria-label={t('profileExtras.quickAdd.add')}>
                                        {inLibrary ? <BsCheck className="text-emerald-400" /> : <BsPlus />}
                                        <span className="hidden sm:inline">{inLibrary ? t('profileExtras.import.inLibrary') : t('profileExtras.quickAdd.add')}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ))}
            </div>
        </Modal>
    );
}
