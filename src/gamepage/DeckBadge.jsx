// Steam Deck compatibility + ProtonDB tier pills (Steam games only), with a details popover.
import { useEffect, useId, useRef, useState } from 'react';
import {
    BsBoxArrowUpRight, BsCheckCircleFill, BsExclamationTriangleFill, BsInfoCircleFill, BsQuestionCircleFill,
    BsSteam, BsXCircleFill,
} from 'react-icons/bs';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { useT } from '../i18n/index.jsx';

const DECK_STYLE = {
    verified: { pill: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', icon: BsCheckCircleFill },
    playable: { pill: 'bg-amber-500/10 border-amber-500/30 text-amber-300', icon: BsInfoCircleFill },
    unsupported: { pill: 'bg-red-500/10 border-red-500/30 text-red-300', icon: BsXCircleFill },
    unknown: { pill: 'bg-white/[0.04] border-white/[0.08] text-[#a1a6b3]', icon: BsQuestionCircleFill },
};

const PROTON_COLOR = {
    platinum: '#c7d5e4',
    gold: '#e5c05b',
    silver: '#b8bcc4',
    bronze: '#d08b4f',
    borked: '#f05252',
    native: '#34d399',
    pending: '#8a8f9c',
};

const NOTE_ICON = {
    ok: { icon: BsCheckCircleFill, color: 'text-emerald-400' },
    warn: { icon: BsInfoCircleFill, color: 'text-amber-400' },
    fail: { icon: BsXCircleFill, color: 'text-red-400' },
    info: { icon: BsExclamationTriangleFill, color: 'text-[#8a8f9c]' },
};

const KNOWN = ['verified', 'playable', 'unsupported', 'unknown'];

export default function DeckBadge({ game }) {
    const { t } = useT();
    const appid = game?.steamAppId;
    const { data } = useApi(appid ? `${API_BASE}/hub/steam/deck/${appid}` : null);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const onDown = e => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
        const onKey = e => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!appid || !data) return null;
    const deck = KNOWN.includes(data.deck) ? data.deck : 'unknown';
    const proton = data.protondb?.tier ? data.protondb : null;
    if (deck === 'unknown' && !proton) return null;

    const style = DECK_STYLE[deck];
    const DeckIcon = style.icon;
    const tierName = tier => (tier ? t(`gameInfo.deck.tiers.${tier}`) : '');
    const items = Array.isArray(data.deckItems) ? data.deckItems : [];
    const noteText = item => {
        const key = `gameInfo.deck.notes.${item.token}`;
        const translated = t(key);
        return translated === key ? item.text : translated;
    };
    const toggle = () => setOpen(o => !o);
    const pillBase = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-semibold transition-colors hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b5cf6]';

    return (
        <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
            {deck !== 'unknown' && (
                <button type="button" onClick={toggle} aria-expanded={open} aria-controls={panelId} className={`${pillBase} ${style.pill}`}>
                    <DeckIcon className="w-3 h-3" aria-hidden="true" />
                    {t(`gameInfo.deck.${deck}`)}
                </button>
            )}
            {proton && (
                <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className={`${pillBase} bg-white/[0.04] border-white/[0.1] text-[#c9ccd4]`}
                    title={t('gameInfo.deck.showDetails')}
                >
                    <span className="w-2 h-2 rounded-full" style={{ background: PROTON_COLOR[proton.tier] }} aria-hidden="true" />
                    {t('gameInfo.deck.protondb', { tier: tierName(proton.tier) })}
                </button>
            )}

            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label={t('gameInfo.deck.title')}
                    className="absolute left-0 top-full mt-2 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl bg-[#171a22] border border-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.55)] p-4 text-left"
                >
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <BsSteam className="w-4 h-4 text-[#a1a6b3]" aria-hidden="true" />
                        {t('gameInfo.deck.title')}
                    </p>

                    {deck !== 'unknown' && (
                        <div className="mt-3">
                            <p className="gh-eyebrow mb-1.5">{t('gameInfo.deck.valveTitle')}</p>
                            <p className={`text-sm font-semibold ${style.pill.split(' ').find(c => c.startsWith('text-'))}`}>{t(`gameInfo.deck.${deck}`)}</p>
                            {items.length > 0 && (
                                <ul className="mt-2 space-y-1.5">
                                    {items.map(item => {
                                        const meta = NOTE_ICON[item.kind] || NOTE_ICON.info;
                                        const Icon = meta.icon;
                                        return (
                                            <li key={item.token} className="flex gap-2 text-xs leading-relaxed text-[#c9ccd4]">
                                                <Icon className={`mt-0.5 w-3 h-3 shrink-0 ${meta.color}`} aria-hidden="true" />
                                                <span>{noteText(item)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}

                    {proton && (
                        <div className="mt-4 pt-3 border-t border-white/[0.06]">
                            <p className="gh-eyebrow mb-1.5">{t('gameInfo.deck.protonTitle')}</p>
                            <p className="text-sm font-semibold" style={{ color: PROTON_COLOR[proton.tier] }}>{tierName(proton.tier)}</p>
                            <p className="mt-1 text-xs text-[#8a8f9c]">
                                {[
                                    proton.trendingTier && proton.trendingTier !== proton.tier ? t('gameInfo.deck.trending', { tier: tierName(proton.trendingTier) }) : null,
                                    proton.bestReportedTier ? t('gameInfo.deck.best', { tier: tierName(proton.bestReportedTier) }) : null,
                                    proton.total ? t('gameInfo.deck.reports', { count: proton.total }) : null,
                                ].filter(Boolean).join(' · ')}
                            </p>
                            <a
                                href={`https://www.protondb.com/app/${appid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#c4b5fd] hover:text-white"
                            >
                                {t('gameInfo.deck.openProtondb')} <BsBoxArrowUpRight className="w-3 h-3" aria-hidden="true" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
